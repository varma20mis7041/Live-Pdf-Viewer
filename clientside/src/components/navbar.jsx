import { useState ,useLayoutEffect, useEffect } from "react";
import axios from "axios";
import { RxCross2 } from "react-icons/rx";
import { GoPlusCircle } from "react-icons/go";
import GetStarted from "./getstarted";
import { Navigate, useNavigate } from "react-router-dom";

import io from 'socket.io-client'

const socket = io.connect("http://localhost:9000")

const NavBar = ({ getPdf, isPresenting }) => {
  const role = localStorage.getItem("role");
  console.log("is presenting",isPresenting)
  const [isAddNew, setAddNew] = useState(false); // Corrected useState syntax
  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);
  const navigate = useNavigate();
  
  const userDetails = JSON.parse(localStorage.getItem("userDetails"));

  const [isViewCount,updateIsViewCountStatus] = useState(false);
  const [currentViewers,updateCurrentViewers] = useState([]);


useEffect(() => {
 // console.log("user details", userDetails);
  if (!userDetails) {
    navigate("/get-started");
  }
}, []);


useEffect(()=>{
 if(role === "admin"){
  socket.on("updated-active-users",(allActiveAdmins)=>{
    const adminActiveusers = allActiveAdmins.find((eachAdmin)=> eachAdmin[0] === userDetails.userName);
    console.log("adminsActiveUsers",adminActiveusers);
    if(adminActiveusers){
      updateCurrentViewers(adminActiveusers[1]);
    }
  })
 }
})


  const submitImage = async (e) => {
    e.preventDefault();
    const userName = userDetails.userName;
    const formData = new FormData();
    formData.append("title", title);
    formData.append("file", file);
    formData.append("userName",userName)

    console.log("Uploading:", title, file);


    try {
      const result = await axios.post(
        "http://localhost:9000/api/admin/upload-files",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      console.log(result);

      if (result.data.status === "ok") {
       
        if (getPdf){
          socket.emit("new-pdf-added")
          getPdf();
        } 
      }
    } catch (error) {
      console.error("Network error:", error);
     
    }
    setAddNew(false)
  };
  

   const start = () => {
    localStorage.removeItem("role");
    localStorage.removeItem("userDetails");
    navigate("/get-started");
   }

   const [isDisplayViewers,updateDisplayViewersStatus] = useState(false);

const onClickViewActiveUsers = () => {
  if(currentViewers.length > 0){
    updateDisplayViewersStatus(!isDisplayViewers);
  }
}

  return (
    <>
    <div className="h-[6vh] w-full bg-teal-800 flex items-center justify-between px-10 text-white">
      <h1>Pdf co-viewer</h1>

      <h1>{userDetails?.name}</h1>
      <div className="flex items-center">
      {isPresenting && (
        <div className="relative  flex justify-center">
        <button className="bg-blue-500 px-3 rounded h-[30px] flex items-center mr-5" onClick={onClickViewActiveUsers}>{currentViewers.length} viewing</button>
        {isDisplayViewers && (
          <div className="absolute right-10  mt-10 bg-teal-800  rounded shadow-lg w-24 p-0 list-none">
         {currentViewers.map((eachViewer, index) => (
            <div key={index}>
              <p className="text-center px-2">{eachViewer}</p>
              {index !== currentViewers.length - 1 && <hr />}
            </div>
          ))}

        </div>
        
        )}
        </div>
        
      )}
      {role === "admin" && (<button className="bg-blue-500 px-3 rounded h-[30px] flex items-center mr-5 " onClick={() => setAddNew(true)}>
      <span><GoPlusCircle /></span> Add Pdf
      </button>
      )}
      
<button className="bg-blue-500 px-3 rounded h-[30px] flex items-center  " onClick={start}>
    Get Started
      </button>
      </div>
      
    </div>
    {isAddNew && (

<div className="fixed top-0 bottom-0 left-0 right-0 z-50 w-screen h-screen">
<div className="w-screen h-screen top-0 bottom-0 right-0 left-0 fixed bg-[rgba(49,49,49,0.8)]">
  <div className="flex items-center justify-center h-screen">
    <div
      className=" w-[90vw] lg:w-[20vw] bg-[#111] text-white font-caslon p-5 pb-8 rounded-md  drop-shadow-lg "
    >
      <div className=" flex items-center justify-end">
        <button
          className="text-[#ffffff]   bottom-1 top-1 z-10"
          onClick={() => setAddNew(false)}
        >
          <RxCross2 size={20} />
        </button>
        
      </div>

      <form className="formStyle" onSubmit={submitImage}>
            <h4 className="text-center">Upload Your Pdf</h4>
            
             <div className="d-flex flex-col justify-between">
             <h1>Title</h1>
            <input
              type="text"
              className="form-control w-full text-black"
              placeholder="Title"
              required
              onChange={(e) => setTitle(e.target.value)}
             
            />
             </div>
     
            <input
              type="file"
              className="form-control mt-6"
              accept="application/pdf"
              required
              onChange={(e) => setFile(e.target.files[0])}
            />
            <br />
            <div className="flex w-full justify-center mt-6">
            <button className="bg-blue-500 px-3 rounded" type="submit">
              Submit
            </button>
            </div>
          </form>
    
  </div> 
</div>
</div>
</div>
      )}
      </>
  );
};

export default NavBar;
