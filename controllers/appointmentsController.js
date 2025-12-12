// controllers/appointmentsController.js
// MedDiscover-API: Randevu (Appointment) Controller
//
// Bu controller şunları yapar:
// - Randevu listesi (filtre + sayfalama)
// - Tek randevu detayı
// - Randevu oluşturma
// - Randevu durum güncelleme (pending/confirmed/cancelled/completed)
// - Randevu bilgilerini güncelleme
// - Soft delete (isActive = false)
// - Health check endpoint'i
//
// Not: Burada iş mantığı Appointment modeline dayanır.
// Appointment modeli: ../models/appointmentModel.js

"use strict";

const mongoose = require("mongoose");
const Appointment = require("../models/appointmentModel");

// ============================================================================
// YARDIMCI FONKSİYONLAR
// ============================================================================

/**
 * MongoDB ObjectId formatını doğrular.
 * @param {string} id - Doğrulanacak ID
 * @returns {boolean} - Geçerli ise true, değilse false
 */
function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

/**
 * Kullanıcının belirli bir randevuya erişim yetkisi olup olmadığını kontrol eder.
 * @param {Object} req - Express request objesi
 * @param {Object} appointment - Randevu dökümanı
 * @returns {boolean} - Yetkili ise true, değilse false
 */
function hasAccessToAppointment(req, appointment) {
  // Admin her şeye erişebilir
  if (req.user && req.user.role === "admin") {
    return true;
  }

  // Doktor kendi randevularına erişebilir
  if (req.user && req.user.role === "doctor") {
    if (String(appointment.doctorId) === String(req.user.id)) {
      return true;
    }
  }

  // Normal kullanıcı sadece kendi randevusuna erişebilir
  if (req.user && String(appointment.userId) === String(req.user.id)) {
    return true;
  }

  return false;
}

/**
 * Kullanıcının randevu durumunu güncelleme yetkisi olup olmadığını kontrol eder.
 * Sadece admin ve doktor rollerinin status değiştirmesine izin verir.
 * @param {Object} req - Express request objesi
 * @returns {boolean} - Yetkili ise true, değilse false
 */
function canUpdateStatus(req) {
  if (!req.user) {
    return false;
  }
  return req.user.role === "admin" || req.user.role === "doctor";
}

/**
 * Sayfalama parametrelerini hazırlar.
 * @param {Object} query - Request query parametreleri
 * @returns {Object} - { page, limit, skip }
 */
function getPaginationParams(query) {
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit, 10) || 20, 1), 100);
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

/**
 * Filtreleri hazırlar.
 *
 * Desteklenen filtreler:
 *  - userId
 *  - clinicId
 *  - doctorId
 *  - treatmentId
 *  - status (pending/confirmed/cancelled/completed)
 *  - dateFrom, dateTo (ISO tarih)
 * @param {Object} query - Request query parametreleri
 * @returns {Object} - MongoDB filter objesi
 */
function buildAppointmentFilters(query) {
  const filters = { isActive: true };

  if (query.userId) {
    filters.userId = query.userId;
  }

  if (query.clinicId) {
    filters.clinicId = query.clinicId;
  }

  if (query.doctorId) {
    filters.doctorId = query.doctorId;
  }

  if (query.treatmentId) {
    filters.treatmentId = query.treatmentId;
  }

  if (query.status) {
    filters.status = query.status;
  }

  if (query.dateFrom || query.dateTo) {
    const dateFilter = {};

    if (query.dateFrom) {
      const from = new Date(query.dateFrom);
      if (!Number.isNaN(from.getTime())) {
        dateFilter.$gte = from;
      }
    }

    if (query.dateTo) {
      const to = new Date(query.dateTo);
      if (!Number.isNaN(to.getTime())) {
        dateFilter.$lte = to;
      }
    }

    // Sadece geçerli tarih filtresi varsa ekle
    if (Object.keys(dateFilter).length > 0) {
      filters.appointmentDate = dateFilter;
    }
  }

  return filters;
}

/**
 * Sıralama (sort) seçenekleri:
 *  - ?sort=date_asc
 *  - ?sort=date_desc
 *  - ?sort=created_asc
 *  - ?sort=created_desc (varsayılan)
 * @param {string} sortQuery - Sort parametresi
 * @returns {Object} - MongoDB sort objesi
 */
function getSortOption(sortQuery) {
  switch (sortQuery) {
    case "date_asc":
      return { appointmentDate: 1 };
    case "date_desc":
      return { appointmentDate: -1 };
    case "created_asc":
      return { createdAt: 1 };
    case "created_desc":
    default:
      return { createdAt: -1 };
  }
}

// ============================================================================
// CONTROLLER FONKSİYONLARI
// ============================================================================

/**
 * GET /api/appointments
 * Randevu listesi (admin veya filtreye göre)
 */
async function getAppointments(req, res) {
  try {
    const { page, limit, skip } = getPaginationParams(req.query);
    const filters = buildAppointmentFilters(req.query);
    const sort = getSortOption(req.query.sort);

    // Eğer normal kullanıcıysa, sadece kendi randevularını görebilsin
    if (req.user && req.user.role !== "admin" && !req.query.userId) {
      filters.userId = req.user.id;
    }

    const [items, total] = await Promise.all([
      Appointment.find(filters).sort(sort).skip(skip).limit(limit),
      Appointment.countDocuments(filters),
    ]);

    const totalPages = Math.ceil(total / limit);

    return res.status(200).json({
      success: true,
      data: items,
      meta: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error) {
    console.error("getAppointments error:", error);
    return res.status(500).json({
      success: false,
      message: "Randevu listesi alınırken bir hata oluştu.",
    });
  }
}

/**
 * GET /api/appointments/:id
 * Tek randevu detayı
 * - Admin herkesin randevusunu görebilir
 * - Doktor kendi randevularını görebilir
 * - Normal kullanıcı sadece kendi randevusunu görebilir
 */
async function getAppointmentById(req, res) {
  try {
    const { id } = req.params;

    // ObjectId formatı kontrolü
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Geçersiz randevu ID formatı.",
      });
    }

    const appointment = await Appointment.findById(id);

    if (!appointment || !appointment.isActive) {
      return res.status(404).json({
        success: false,
        message: "Randevu bulunamadı.",
      });
    }

    // Yetki kontrolü
    if (!hasAccessToAppointment(req, appointment)) {
      return res.status(403).json({
        success: false,
        message: "Bu randevuya erişim yetkiniz yok.",
      });
    }

    return res.status(200).json({
      success: true,
      data: appointment,
    });
  } catch (error) {
    console.error("getAppointmentById error:", error);
    return res.status(500).json({
      success: false,
      message: "Randevu bilgisi alınırken bir hata oluştu.",
    });
  }
}

/**
 * POST /api/appointments
 * Yeni randevu oluşturma
 *
 * Beklenen alanlar:
 *  - userId (eğer auth middleware ile otomatik gelmiyorsa body'den)
 *  - clinicId
 *  - doctorId
 *  - treatmentId
 *  - appointmentDate (ISO string)
 *  - notes (opsiyonel)
 */
async function createAppointment(req, res) {
  try {
    let { userId } = req.body;
    const { clinicId, doctorId, treatmentId, appointmentDate, notes } =
      req.body;

    // Eğer auth middleware varsa userId oradan gelsin
    if (req.user && req.user.id) {
      userId = req.user.id;
    }

    if (!userId || !clinicId || !doctorId || !treatmentId || !appointmentDate) {
      return res.status(400).json({
        success: false,
        message:
          "userId, clinicId, doctorId, treatmentId ve appointmentDate zorunludur.",
      });
    }

    const dateObj = new Date(appointmentDate);
    if (Number.isNaN(dateObj.getTime())) {
      return res.status(400).json({
        success: false,
        message: "appointmentDate geçerli bir tarih olmalıdır.",
      });
    }

    const appointment = await Appointment.create({
      userId,
      clinicId,
      doctorId,
      treatmentId,
      appointmentDate: dateObj,
      notes: notes || "",
      status: "pending", // varsayılan durum
      isActive: true,
    });

    return res.status(201).json({
      success: true,
      data: appointment,
    });
  } catch (error) {
    console.error("createAppointment error:", error);
    return res.status(500).json({
      success: false,
      message: "Randevu oluşturulurken bir hata oluştu.",
    });
  }
}

/**
 * PUT /api/appointments/:id
 * Randevunun tüm alanlarını (uygun olanları) güncelleme
 * - Admin tüm randevuları güncelleyebilir
 * - Doktor kendi randevularını güncelleyebilir
 * - Kullanıcı sadece kendi randevusunun belirli alanlarını güncelleyebilir
 */
async function updateAppointment(req, res) {
  try {
    const { id } = req.params;

    // ObjectId formatı kontrolü
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Geçersiz randevu ID formatı.",
      });
    }

    // Önce randevuyu bul ve yetki kontrolü yap
    const existingAppointment = await Appointment.findById(id);

    if (!existingAppointment) {
      return res.status(404).json({
        success: false,
        message: "Güncellenecek randevu bulunamadı.",
      });
    }

    // Yetki kontrolü
    if (!hasAccessToAppointment(req, existingAppointment)) {
      return res.status(403).json({
        success: false,
        message: "Bu randevuyu güncelleme yetkiniz yok.",
      });
    }

    // Kullanıcı rolüne göre güncellenebilir alanları belirle
    let allowedFields;
    if (req.user && (req.user.role === "admin" || req.user.role === "doctor")) {
      // Admin ve doktor tüm alanları güncelleyebilir
      allowedFields = [
        "clinicId",
        "doctorId",
        "treatmentId",
        "appointmentDate",
        "notes",
        "status",
        "isActive",
      ];
    } else {
      // Normal kullanıcı sadece bazı alanları güncelleyebilir
      allowedFields = ["appointmentDate", "notes"];
    }

    const updateData = {};

    for (const key of allowedFields) {
      if (Object.prototype.hasOwnProperty.call(req.body, key)) {
        updateData[key] = req.body[key];
      }
    }

    if (updateData.appointmentDate) {
      const dateObj = new Date(updateData.appointmentDate);
      if (Number.isNaN(dateObj.getTime())) {
        return res.status(400).json({
          success: false,
          message: "appointmentDate geçerli bir tarih olmalıdır.",
        });
      }
      updateData.appointmentDate = dateObj;
    }

    const updated = await Appointment.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    return res.status(200).json({
      success: true,
      data: updated,
    });
  } catch (error) {
    console.error("updateAppointment error:", error);
    return res.status(500).json({
      success: false,
      message: "Randevu güncellenirken bir hata oluştu.",
    });
  }
}

/**
 * PATCH /api/appointments/:id/status
 * Sadece randevu durumunu günceller.
 * Örn: pending → confirmed, confirmed → completed, vs.
 * Sadece admin ve doktor rollerine izin verilir.
 */
async function updateAppointmentStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // ObjectId formatı kontrolü
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Geçersiz randevu ID formatı.",
      });
    }

    // Yetki kontrolü - sadece admin ve doktor status güncelleyebilir
    if (!canUpdateStatus(req)) {
      return res.status(403).json({
        success: false,
        message: "Randevu durumunu güncelleme yetkiniz yok.",
      });
    }

    const allowedStatuses = ["pending", "confirmed", "cancelled", "completed"];

    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message:
          "Geçersiz status değeri. İzin verilenler: pending, confirmed, cancelled, completed.",
      });
    }

    // Doktor için ek kontrol - sadece kendi randevularının durumunu değiştirebilir
    if (req.user && req.user.role === "doctor") {
      const appointment = await Appointment.findById(id);
      if (!appointment) {
        return res.status(404).json({
          success: false,
          message: "Randevu bulunamadı.",
        });
      }
      if (String(appointment.doctorId) !== String(req.user.id)) {
        return res.status(403).json({
          success: false,
          message: "Bu randevunun durumunu güncelleme yetkiniz yok.",
        });
      }
    }

    const updated = await Appointment.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Randevu bulunamadı.",
      });
    }

    return res.status(200).json({
      success: true,
      data: updated,
    });
  } catch (error) {
    console.error("updateAppointmentStatus error:", error);
    return res.status(500).json({
      success: false,
      message: "Randevu durumu güncellenirken bir hata oluştu.",
    });
  }
}

/**
 * DELETE /api/appointments/:id
 * Soft delete: randevuyu pasif hale getirir (isActive = false)
 * - Admin tüm randevuları silebilir
 * - Kullanıcı sadece kendi randevusunu silebilir (ve sadece pending durumda ise)
 */
async function deleteAppointment(req, res) {
  try {
    const { id } = req.params;

    // ObjectId formatı kontrolü
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Geçersiz randevu ID formatı.",
      });
    }

    const appointment = await Appointment.findById(id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Silinecek randevu bulunamadı.",
      });
    }

    // Yetki kontrolü
    if (!hasAccessToAppointment(req, appointment)) {
      return res.status(403).json({
        success: false,
        message: "Bu randevuyu silme yetkiniz yok.",
      });
    }

    // Normal kullanıcı sadece pending durumundaki randevuları iptal edebilir
    if (req.user && req.user.role !== "admin" && req.user.role !== "doctor") {
      if (appointment.status !== "pending") {
        return res.status(400).json({
          success: false,
          message:
            "Sadece beklemede (pending) durumundaki randevular iptal edilebilir.",
        });
      }
    }

    appointment.isActive = false;
    await appointment.save();

    return res.status(200).json({
      success: true,
      message: "Randevu pasif hale getirildi.",
    });
  } catch (error) {
    console.error("deleteAppointment error:", error);
    return res.status(500).json({
      success: false,
      message: "Randevu silinirken bir hata oluştu.",
    });
  }
}

/**
 * Basit health check
 * GET /api/appointments/health
 */
async function healthCheck(req, res) {
  try {
    const total = await Appointment.countDocuments({});
    const active = await Appointment.countDocuments({ isActive: true });

    return res.status(200).json({
      success: true,
      message: "AppointmentsController aktif.",
      stats: {
        totalAppointments: total,
        activeAppointments: active,
      },
    });
  } catch (error) {
    console.error("appointments healthCheck error:", error);
    return res.status(500).json({
      success: false,
      message: "Health check sırasında bir hata oluştu.",
    });
  }
}

module.exports = {
  getAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointment,
  updateAppointmentStatus,
  deleteAppointment,
  healthCheck,
};
