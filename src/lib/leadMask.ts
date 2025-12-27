export function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!local || !domain) {
    return email;
  }
  const firstChar = local[0] ?? "";
  return `${firstChar}***@${domain}`;
}

export function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length <= 3) {
    return `${digits}***`;
  }
  const visible = digits.slice(-3);
  return `***${visible}`;
}

export function maskName(name: string): string {
  if (!name) return name;
  const firstChar = name.trim()[0] ?? "";
  return `${firstChar}***`;
}
