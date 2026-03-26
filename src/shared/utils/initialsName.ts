export const getInitials = (firstname: string, lastname?: string) => {
  return (
    firstname.charAt(0) +
    (lastname ? lastname.charAt(0) : "")
  ).toUpperCase();
};