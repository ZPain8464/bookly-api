function makeUsersArray() {
  return [
    {
      email: "user@example.com",
      first_name: "John",
      last_name: "Doe",
      password: "Password#3",
      profile_image: "",
      phone_number: "",
      confirmPassword: "Password#3",
    },
  ];
}

module.exports = {
  makeUsersArray,
};
