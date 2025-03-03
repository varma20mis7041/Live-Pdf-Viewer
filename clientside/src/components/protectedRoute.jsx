import {Route,useNavigate} from 'react-router-dom'
const ProtectedRoute = (props) => {
    const userDetails = JSON.parse(localStorage.getItem("userDetails"));
    const navigage = useNavigate();
    if(userDetails === undefined){
        return navigage("/get-started")
    }else{
        return <Route {...props} />
    }
}

export default ProtectedRoute