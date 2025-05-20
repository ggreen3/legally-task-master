
export const sendEmailNotification = (email: string, subject: string, body: string) => {
  // Create the mailto URL with encoded subject and body
  const mailtoUrl = `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  
  // Open the user's email client
  window.open(mailtoUrl, '_blank');
  
  return true;
};
