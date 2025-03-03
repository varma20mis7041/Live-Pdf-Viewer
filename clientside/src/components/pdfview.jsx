import { useEffect, useState } from "react";
import axios from "axios";
import PdfComp from "../Pdf";
import { pdfjs } from 'react-pdf';
import NavBar from "./navbar";
import { FaFilePdf } from "react-icons/fa6";
import io from 'socket.io-client';
import GetStarted from "./getstarted";
import { useNavigate } from "react-router-dom";
import { GrFormPrevious } from "react-icons/gr";
import { FaUser } from "react-icons/fa";

const socket = io.connect("http://localhost:9000");

const flow = {
  admins : "Admin View",
  adminFiles : "Admin Files View",
  presentationStopped:"Presentation stopped"
}

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

const PdfView = ()=> {
  const [avlFiles, setavlFiles] = useState([]);
  const [pdfFile, setPdfFile] = useState(null);
  const [adminFiles,setAdminFiles] = useState([]);
  const [selectedAdmin,updateSelectedAdmin] = useState(null)

  const [currentTabView,updateCurrentTabView] = useState(flow.admins)

  const [isPresenting,updatePresentingStatus]  = useState(false);
  const [selectedAdminIndex,updateSelectedAdminIndex] = useState(null);

  const role = localStorage.getItem("role");
  const navigate = useNavigate();

  const userDetails = JSON.parse(localStorage.getItem("userDetails"));
 console.log("user details in pdf",userDetails)

  useEffect(() => {
    
  }, [role]);



  useEffect(() => {
  //  console.log("role ",role)
    if (role === undefined) {
      navigate('/get-started');
    }else if(role === "admin"){
      getPdf();
    }else{
      fetchAdmins();
    }
  }, []);

  const [currindex,updateCurrentIndex] = useState(null);

  const getPdf = async () => {
    try {
      // const result = await axios.get("http://localhost:9000/get-files");
      const response =await axios.get(`http://localhost:9000/api/admin/${userDetails.userName}`);
     // console.log(response)
    // console.log(response.data.admin)
    console.log("new pdf status",response.data.admin.pdfs)
      setavlFiles(response.data.admin.pdfs);
     // console.log(avlFiles)
    } catch (error) {
      console.error("Error fetching PDFs:", error);
    }
  };



  const fetchAdmins = async () => {
    try {
      const response = await axios.get('http://localhost:9000/api/user/admins');
     console.log('Admins:', response.data);
      setAdminFiles(response.data.admins)
    } catch (error) {
      console.error('Fetch Admins Error:', error.response ? error.response.data : error.message);
    }
  };
  
  
  
  
const [currentAdminFiles,updateCurrentAdminFiles]  = useState([]);
const [currentPresentersList, updateCurrentPresentersList] = useState([]);



useEffect(() => {
  socket.emit("get-active-admins")
  socket.on("currentindex", (ind) => {
   // console.log("Received index from server:", ind);
    updateCurrentIndex(ind.index);
    showPdfI(ind.index);
  });

  socket.on("fetchAdmins",()=>{
    // console.log("fetch admin cal in user side")
    fetchAdmins();
  })

  socket.on("new-pdf-added",()=>{
    fetchAdmins()
    

  })

  socket.on("current-admins",(admins)=>{
    console.log("on reload")
    updateCurrentPresentersList(admins);
  })

  socket.on("presentation-stopped",()=>{
    if(currentTabView === flow.adminFiles){
      updateCurrentTabView(flow.presentationStopped);
      
    }
  })

  // socket.on("currentAdmin", (presentationDetails) => {
  //  // console.log("current admin", presentationDetails);
  //   const { index, page, adminId } = presentationDetails;

  //   updateCurrentPresentersList((prevAdminList) => {
  //     const adminExists = prevAdminList.some((admin) => admin.adminId === adminId);

  //     if (adminExists) {
  //       return prevAdminList.map((admin) =>
  //         admin.adminId === adminId ? { ...admin, index, page } : admin
  //       );
  //     } else {
  //       return [...prevAdminList, { adminId, index, page }];
  //     }
  //   });
  // });

  // Clean up event listeners on unmount
  return () => {
    socket.off("currentindex");
    socket.off("current-admins");
    socket.on("presentation-stopped",()=>{
      if(currentTabView === flow.adminFiles){
        updateCurrentTabView(flow.presentationStopped);
      }
    });
    socket.off("presentation-stopped")
  };
  
}, []);

// useEffect to monitor updates to currentPresentersList

useEffect(()=>{
    console.log(selectedAdminIndex)
    console.log(adminFiles)
    const selectedAdminFiles = adminFiles[selectedAdminIndex]?.pdfs;
    updateCurrentAdminFiles(selectedAdminFiles)
},[adminFiles])

const isActive = (id) => {
  const adminExists = currentPresentersList.some((admin) => admin[0] === id);
  return adminExists;
}


  const showPdfI = (id) => {
  //  console.log(id)
    if (avlFiles[id]) {
     // console.log("avlfiles",avlFiles)
      const pdf = avlFiles[id].fileName;
      setPdfFile(`http://localhost:9000/files/${pdf}`);
    //  console.log(pdf);
    }else{
     // console.log("else")
    }
  };
  

  const showPdf = (pdf, index) => {
    updateCurrentIndex(index);
    // socket.emit("index", { index });
    socket.emit("page", { message: 1 });
    const presentationDetails = {index,page:1,adminId:userDetails.userName};
    updateCurrentActiveAdmin([userDetails.userName,{pdfIndex:index,pagenumber:1}])
    socket.emit("admin",presentationDetails);
    const pdf_name = avlFiles[index].fileName;
    setPdfFile(`http://localhost:9000/files/${pdf_name}`);
    updatePresentingStatus(true)
  };

  
console.log("crrind",currindex)

const [currentAdminSelectedPdf,updateCurrentAdminPdf] = useState()

const [isAdminOffline,setAdminOnlineStatus] = useState(false)


const [currentActiveAdmin,updateCurrentActiveAdmin] = useState()

useEffect(() => {
 // console.log("Updated current presenters list:", currentPresentersList);
 // console.log(userDetails.userName)

// console.log("current admin",currentAdmin)
  if(role === "admin"){
    const currentAdmin = currentPresentersList.find((eachAdmin)=>eachAdmin[0] === userDetails.userName);
    if(currentAdmin){
     updateCurrentActiveAdmin(currentAdmin)
    }
  }
  if(currentTabView === flow.adminFiles){
    onClickView(selectedAdminIndex)
  }
}, [currentPresentersList]);


const [isUserActive,updateUserActiveStatus] = useState(false);

const onClickView = (index) => {
  if(index != null){
    updateSelectedAdminIndex(index);
    const selectedAdminFiles = adminFiles[index].pdfs;
    const adminId = adminFiles[index].userName;
    const selectedPdf  = currentPresentersList.find((eachAdmin)=>eachAdmin[0] === adminId)
    if(!selectedPdf){
      setAdminOnlineStatus(false);
      setPdfFile(null);
      updateCurrentAdminPdf();
    }else{
      setAdminOnlineStatus(true)
      updateCurrentActiveAdmin(selectedPdf)
      updateCurrentAdminPdf(selectedPdf[1].pdfIndex);
      const pdfFileName = selectedAdminFiles[selectedPdf[1].pdfIndex].fileName;
     // console.log("pdf file name",pdfFileName)
      setPdfFile(`http://localhost:9000/files/${pdfFileName}`);
     // console.log(selectedPdf)
      updateSelectedAdmin(adminFiles[index].userName)
      updateCurrentAdminFiles(selectedAdminFiles)
      updateCurrentTabView(flow.adminFiles)
      if(!isUserActive){
        socket.emit("add-active-user",{adminId,userName :userDetails.name});
        updateUserActiveStatus(true);
      }
    }
  }
  
  
}

// const onClickView = (index) => {
//   if(index != null){
//     updateSelectedAdminIndex(index);
//     const selectedAdminFiles = adminFiles[index].pdfs;
//     const adminId = adminFiles[index].userName;
//     const selectedPdf  = currentPresentersList.find((eachAdmin)=>eachAdmin.adminId === adminId)
//     if(selectedPdf === undefined){
//       setAdminOnlineStatus(false);
//     }else{
//       setAdminOnlineStatus(true)
//       updateCurrentAdminPdf(selectedPdf.index);
//       const pdfFileName = selectedAdminFiles[selectedPdf.index].fileName;
//      // console.log("pdf file name",pdfFileName)
//       setPdfFile(`http://localhost:9000/files/${pdfFileName}`);
//      // console.log(selectedPdf)
//       updateSelectedAdmin(adminFiles[index].userName)
//       updateCurrentAdminFiles(selectedAdminFiles)
//       updateCurrentTabView(flow.adminFiles)
//     }
//   }
  
  
// }

const isSelected = () => {
  currentPresentersList.map((eachAdmin)=>{
  //  console.log("is selected",eachAdmin,selectedAdmin)
    if(eachAdmin === selectedAdmin){
      return eachAdmin.index;
    }
  })
  return -1;
}


const onClickStop = () => {
  socket.emit("stop-presenting",userDetails.userName)
  updatePresentingStatus(false);
  setPdfFile(null);
  updateCurrentIndex(null);
}

const onClickGoBack = () => {
  updateCurrentTabView(flow.admins);
  setPdfFile(null);
    socket.emit("remove-unactive-user",{adminId:currentActiveAdmin[0],userName :userDetails.name});
    updateUserActiveStatus(false);
  
  
}

// console.log("selected user ",currentAdminFiles);
  return (
    <div className="">
      <NavBar getPdf={getPdf} isPresenting={isPresenting}/>
      <div className="min-h-[130vh] flex justify-end bg-slate-300">
  <div className="w-[80vw] flex justify-center">
    {pdfFile !== null ? (
      <PdfComp pdfFile={pdfFile} adminDetails={currentActiveAdmin} />
    ) : (
      <div className="flex flex-col justify-center">
        {role === "admin" && "Choose a file to start presentation!"}
        {role === "user" && "Select a admin who are online"}
      </div>
    )}
  </div>

  <div className="w-[20vw] h-[130vh] bg-black">
    {role === "admin" ? (
      // Admin view
      avlFiles.length === 0 ? (
        <div className="h-full flex flex-col justify-center items-center">
          <h1 className="text-white">No PDFs found</h1>
        </div>
      ) : (
        <>
          <h1 className="text-white text-center w-full text-3xl mt-5">Added Files</h1>
          <div className="flex flex-wrap p-5 mt-10">
            {avlFiles.map((eachpdf, index) => (
              <div
                key={index}
                className={`h-[100px] w-[150px] border border-black text-black mr-3 mb-3 flex flex-col justify-center items-center rounded-md 
                ${currindex === index ? " text-white bg-gray-800 border-white" : "bg-white"}`}
              >
                <div>
                  <FaFilePdf />
                </div>
                <h1>Name : {eachpdf.title}</h1>
                {currindex === index ? (
                  <button
                  onClick={() => onClickStop()}
                  className="px-5 bg-blue-500 text-white rounded"
                >
                  Stop
                </button>
                ):(
                  <button
                  onClick={() => showPdf(eachpdf.pdf, index)}
                  className="px-5 bg-blue-500 text-white rounded"
                >
                  Present
                </button>
                )}
              </div>
            ))}
          </div>
        </>
      )
    ) : (
      // Non-admin view
      adminFiles.length === 0 ? (
        <div className="h-full flex flex-col justify-center items-center">
          <h1 className="text-white">No Admins Found</h1>
        </div>
      ) : (
        <>
          {currentTabView !== flow.admins ? (
  currentAdminFiles.length === 0 ? (
    <div className="h-full flex flex-col justify-center items-center">
      <h1 className="text-white">No Files Found</h1>
    </div>
  ) : (
    <>
    <h1 className="text-white text-center w-full text-3xl mt-5">Admin Files</h1>
    <button className="ml-3" onClick={()=>{onClickGoBack()}}><GrFormPrevious className="text-white" size={30} /></button>
    <div className="flex flex-wrap p-5 mt-10">

    
    {currentAdminFiles.map((eachFile, index) => (
      <div
        key={index}
        className={`h-[100px] w-[150px] border border-black text-black mr-3 mb-3 flex flex-col justify-center items-center rounded-md 
        ${currentAdminSelectedPdf === index ? " text-white bg-gray-800 border-white" : "bg-white"}`}
      
      >
        <div>
          <FaFilePdf />
        </div>
        <h1>Name : {eachFile.title}</h1>
        {/* <button
          className="px-5 bg-blue-500 text-white rounded"
          onClick={() => onClickView(index)}
        >
          View
        </button> */}
      </div>
    ))}
    </div>
    </>
  )
) : (
  <>
    <h1 className="text-white text-center w-full text-3xl mt-5">Admins</h1>
    <div className="flex flex-wrap p-5 mt-10">
      {adminFiles.map((eachAdmin, index) => (
        <div
          key={index}
          className={`h-[100px] w-[150px] border border-black text-black mr-3 mb-3 flex flex-col justify-center items-center rounded-md 
          ${currindex === index ? " text-white bg-gray-800 border-white" : "bg-white"} 
          ${isSelected() === index ? " text-white bg-gray-800 border-white" : "bg-white"} 
          `}
        >
          <div>
            <FaUser />
          </div>
          {isActive(eachAdmin.userName) ? <p className="text-green-600">online</p> : <p className>offline</p>}
          <h1>Name : {eachAdmin.name}</h1>
          <button
            className={`px-5 bg-blue-500 text-white rounded ${isActive(eachAdmin.userName) ? "opacity-100 cursor-pointer":"opacity-65 cursor-not-allowed"}  `}
            onClick={() => onClickView(index)}
          >
            View
          </button>
        </div>
      ))}
    </div>
  </>
)}
{currentTabView === flow.presentationStopped && (
  <div className="flex flex-wrap p-5 mt-10">
       <div className="h-full flex flex-col justify-center items-center">
      <h1 className="text-white">Adimin closed the presentation</h1>
      <button className="px-5 bg-blue-500 text-white rounded">Go back</button>
    </div>
  </div>
)}

        </>
      )
    )}
  </div>
</div>

    </div>
  );
}

export default PdfView;
