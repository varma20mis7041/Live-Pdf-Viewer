import { useEffect, useState } from 'react';
import { Document, Page } from 'react-pdf';


import { GrFormNext, GrFormPrevious } from "react-icons/gr";
import io from 'socket.io-client'

const socket = io.connect("http://localhost:9000")


function PdfComp(props) {
  const {adminDetails} = props;
 // console.log("current active admin",adminDetails)
  const role = localStorage.getItem("role");
  let adminId;
  let pdfIndex;
  if(role === "admin"){
     adminId = adminDetails[0]
     pdfIndex = adminDetails[1].pdfIndex;
  }
  
  const [numPages, setNumPages] = useState();
  const [pageNumber, setPageNumber] = useState(1);

  function onDocumentLoadSuccess({numPages}) {
    setNumPages(numPages);
  }

  const prev = () => {
    if(pageNumber >1){
      setPageNumber((prevPageNumber)=>prevPageNumber-1)
      socket.emit("admin", { adminId , index : pdfIndex , page : pageNumber-1});
    }
  }
  

  const next = () => {
    console.log("Next button clicked");
    if (pageNumber < numPages) {
      setPageNumber((prevPageNumber)=>prevPageNumber+1);
      socket.emit("admin", { adminId , index : pdfIndex , page : pageNumber+1});
    }
  };
  
  useEffect(()=>{
    if(adminDetails){
      setPageNumber(adminDetails[1].pageNumber)
    }
  })


  return (
    <div className='w-[30vw] h-[80vh] mt-2 flex flex-col items-center'>
  <Document file={props.pdfFile} onLoadSuccess={onDocumentLoadSuccess}>
    <Page pageNumber={pageNumber} renderTextLayer={false} renderAnnotationLayer={false} />
  </Document>
  <div className='flex flex-row items-center justify-center mt-2 space-x-2'>
    {role === "admin" && (<button onClick={prev}><GrFormPrevious /></button>)}
    <div>{`${pageNumber} / ${numPages}`}</div>
    {role === "admin" && (<button onClick={next}><GrFormNext /></button>)}
  </div>
</div>

  );
}

export default PdfComp