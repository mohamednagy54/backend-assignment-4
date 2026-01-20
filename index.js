const express = require('express')
const fs = require('node:fs')
const path = require('node:path')

const PORT = 3000
const app = express()

app.use(express.json())

const Users_Storage_File = path.join(__dirname, 'users.json')


const readUsers = () => {
  const data = fs.readFileSync(Users_Storage_File, "utf-8");
  return JSON.parse(data);
};

const writeUsers = (users) => {
  fs.writeFileSync(Users_Storage_File, JSON.stringify(users, null, 2));
};



// Create User

app.post("/user", (req, res) => { 
  const { name, age, email } = req.body

    if (!name || !age || !email) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  let users = readUsers()

 

  // check if email is already in use
  const emailExists = users.find(user => user.email === email)
  if (emailExists) { 
    return res.status(400).json({ message: "Email already in use" });
  }

  // create new user with unique id
  const newId =
  users.length === 0
    ? 1
      : Math.max(...users.map(u => u.id)) + 1;
  
  const newUser = {
    id: newId,
    name,
    age,
    email
  }

  users.push(newUser)

  writeUsers(users)
  res.status(201).json({ status: "success",  message: "User created successfully" })


  
  

})

// Update User

app.patch("/user/:id", (req, res) => { 
  const { id } = req.params
  const { name, age, email } = req.body


  const users = readUsers()
  const userIndex = users.findIndex(user => user.id == id)
  if (userIndex === -1) {
    return res.status(404).json({ status: "error", message: "User not found" })
  }
  
  if (email) {
    const emailExists = users.find(
      (u) => u.email === email && u.id !== id
    );
    if (emailExists) {
      return res.status(400).json({ message: "Email already exists" });
    }
  }
  users[userIndex] = {
    ...users[userIndex],
    ...(name && { name }),
    ...(age && { age }),
    ...(email && { email }),  
  };

  writeUsers(users)
  res.status(200).json({ status: "success", message: "User updated successfully" })

})


// Delete User

app.delete("/user/:id", (req, res) => { 
  const { id } = req.params
  const users = readUsers()
  const userIndex = users.findIndex(user => user.id == id)
  if (userIndex === -1) {
    return res.status(404).json({ status: "error", message: "User not found" })
  }
  users.splice(userIndex, 1)
  writeUsers(users)
  res.status(200).json({ status: "success", message: "User deleted successfully" })
})



// Get All Users

app.get("/user", (req, res) => { 
  const users = readUsers()
  res.status(200).json({ status: "success", data: users })
})

// Get User by Name
app.get("/user/getByName", (req, res) => {
  const { name } = req.query;

  if (!name) {
    return res.status(400).json({ status: "error", message: "Name query is required" });
  }

  const users = readUsers();

  const user = users.find((u) => u.name.toLowerCase() === name.toLowerCase());

  if (!user) {
    return res.status(404).json({ status: "error", message: "User not found" });
  }

  res.status(200).json({ status: "success", data: user });
});



// Get by Filters (minAge) /user/filter?minAge=20


app.get("/user/filter", (req, res) => {
  const minAge = req.query.minAge;

  if (!minAge) {
    return res.status(400).json({ status: "error", message: "minAge query parameter is required" });
  }

  const minAgeNum = Number(minAge);
  if (isNaN(minAgeNum) || minAgeNum < 0) {
    return res.status(400).json({ status: "error", message: "Invalid age: must be a non-negative number" });
  }

  const users = readUsers();
  const filteredUsers = users.filter((u) => u.age >= minAgeNum);
  

  
  if (filteredUsers.length === 0) {
    return res.status(404).json({
      status: "error",
      message: "No users found with this age",
    });
  }

  res.status(200).json({
    status: "success",
    data: filteredUsers,
  });
});


// Get User by Id

app.get("/user/:id", (req, res) => { 
  const { id } = req.params
  const users = readUsers()
  const user = users.find(user => user.id == id)
  if (!user) {
    return res.status(404).json({ status: "error", message: "User not found" })
  }
  res.status(200).json({ status: "success", data: user })
})




app.listen(PORT, () => {
  console.log(`Server running on  http://localhost:${PORT}`)
})
