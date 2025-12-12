// models/appointmentModel.js
// MedDiscover-API: Randevu (Appointment) Modeli

"use strict";

const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "userId zorunludur"],
      index: true,
    },
    clinicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Clinic",
      required: [true, "clinicId zorunludur"],
      index: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: [true, "doctorId zorunludur"],
      index: true,
    },
    treatmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Treatment",
      required: [true, "treatmentId zorunludur"],
    },
    appointmentDate: {
      type: Date,
      required: [true, "appointmentDate zorunludur"],
      index: true,
    },
    status: {
      type: String,
      enum: {
        values: ["pending", "confirmed", "cancelled", "completed"],
        message: "Status değeri geçersiz: {VALUE}",
      },
      default: "pending",
      index: true,
    },
    notes: {
      type: String,
      default: "",
      maxlength: [1000, "Notlar 1000 karakteri aşamaz"],
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true, // createdAt ve updatedAt otomatik eklenir
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Compound index for common queries
appointmentSchema.index({ userId: 1, status: 1, isActive: 1 });
appointmentSchema.index({ doctorId: 1, appointmentDate: 1, isActive: 1 });
appointmentSchema.index({ clinicId: 1, appointmentDate: 1, isActive: 1 });

// Virtual for formatted date (optional)
appointmentSchema.virtual("formattedDate").get(function () {
  if (this.appointmentDate) {
    return this.appointmentDate.toISOString().split("T")[0];
  }
  return null;
});

const Appointment = mongoose.model("Appointment", appointmentSchema);

module.exports = Appointment;
