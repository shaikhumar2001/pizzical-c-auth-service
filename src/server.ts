function welcome(name: string) {
  console.log("Welcome to Pizzical.");

  const user = { name: "john" };

  const fname = user.name;

  return name + fname;
}

welcome("Doe");
