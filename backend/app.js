const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
app.use(express.json());

const adminRoutes = require('./routes/admin');
const userRoutes = require('./routes/user');



app.use(cors());



app.use('/api/admin', adminRoutes);
app.use('/api/user', userRoutes);


const http = require("http");

const server = http.createServer(app);

const {Server} = require("socket.io");

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
  },
});


const activeAdmins = new Map();
const activeUsers = new Map();

io.on("connection", (socket) => {
  console.log("A new user has connected", socket.id);

  try {
    socket.on("page", (data) => {
      socket.broadcast.emit("currentpage", data);
      console.log("currentpage", data);
    });

    socket.on("index", (index) => {
      socket.broadcast.emit("currentindex", index);
      console.log("currentindex", index);
    });

    socket.on("new-admin-added",()=>{
      console.log("fetch admin call")
      socket.broadcast.emit("fetchAdmins");
    })

    socket.on("new-pdf-added",()=>{
      socket.broadcast.emit("new-pdf-added")
    })

    socket.on("admin", (presentationDetails) => {
      const {adminId,index,page} = presentationDetails;
      activeAdmins.set(adminId,{pdfIndex:index,pageNumber:page})
      io.emit("current-admins",Array.from(activeAdmins.entries()))
      if(presentationDetails) {
        io.emit("currentAdmin", presentationDetails);
        console.log(presentationDetails)
      } else {
        console.error("userName is undefined");
      }
      console.log("current admins",activeAdmins);
    });

    socket.on("get-active-admins",()=>{
      console.log("on reload",activeAdmins)
      socket.emit("current-admins", Array.from(activeAdmins.entries()));
    })

    socket.on("stop-presenting",adminId=>{
      activeAdmins.delete(adminId);
      activeUsers.delete(adminId);
      socket.broadcast.emit("current-admins", Array.from(activeAdmins.entries()));
      socket.broadcast.emit("updated-active-users",Array.from(activeUsers))
      socket.broadcast.emit("presentation-stopped")
      console.log("on delete",activeAdmins)
    })

    socket.on("add-active-user",(activeUserDetails)=>{
      const {adminId,userName} = activeUserDetails; 
      const existingAdmin = activeUsers.get(adminId);
      if(existingAdmin){
        let existingUserList = existingAdmin;
        existingUserList.push(userName);
        activeUsers.set(adminId,existingUserList)
        socket.broadcast.emit("updated-active-users",Array.from(activeUsers))
      }else{
        activeUsers.set(adminId,[userName]);
        socket.broadcast.emit("updated-active-users",Array.from(activeUsers))
      }

      console.log("active users",activeUsers)

    })
    socket.on("remove-unactive-user",(unActiveUserDetails)=>{
      console.log(unActiveUserDetails)
        const {adminId,userName} = unActiveUserDetails;
        let adminActiveList = activeUsers.get(adminId);
        const updatedList = adminActiveList.filter((eachUser) => eachUser !== userName);
        activeUsers.set(adminId,updatedList);
        socket.broadcast.emit("updated-active-users",Array.from(activeUsers))
        console.log(activeUsers)
    })

   
  } catch (error) {
    console.error("Error in socket event handling:", error);
  }
});



app.use(express.json());


app.use("/files",express.static("files"))

const initializeDBAndServer = async () => {

 const username = encodeURIComponent(process.env.MONGO_USERNAME);
    const password = encodeURIComponent(process.env.MONGO_PASSWORD);
    const uri = `mongodb+srv://${username}:${password}@cluster0.ki5m4.mongodb.net/ecs?retryWrites=true&w=majority&tls=true&appName=Cluster0`;
  
    try {
        await mongoose.connect(uri);
        console.log("Connected to MongoDB...");
        server.listen(9000, () => {
            console.log('Server running on port: 9000');
        });
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        process.exit(1);
    }
};

initializeDBAndServer();

