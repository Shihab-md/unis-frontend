export const translateDemoTutorialMessage = (tr, message) => {
  const text = String(message || "").trim();
  if (!text) return text;

  const invalidRoles = /^Invalid visible role\(s\):\s*(.+)$/i.exec(text);
  if (invalidRoles?.[1]) {
    return tr("Invalid visible role(s): {{roles}}", { roles: invalidRoles[1] });
  }

  const maxSize = /^File is too large\. Maximum allowed size is\s+(.+?)\s+MB\.$/i.exec(text);
  if (maxSize?.[1]) {
    return tr("File is too large. Maximum allowed size is {{size}} MB.", { size: maxSize[1] });
  }

  return tr(text);
};
