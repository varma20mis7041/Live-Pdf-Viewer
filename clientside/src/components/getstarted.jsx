import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import io from 'socket.io-client'
const socket = io.connect("http://localhost:9000");
const flow = {
    get_started: "GET STARTED",
    admin_login: "ADMIN LOGIN",
    user_login: "USER LOGIN",
    admin_login_form: "Login Form",
    admin_register_form: "Admin Register Form",
    user_login_form: "User Login Form",
    user_register_form: "User Register Form"
};

const GetStarted = () => {
    const [currentFlow, updateCurrentFlow] = useState(flow.get_started);
    const [userId, setUserId] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

   
    const registerAdmin = async () => {
        try {
            const response =await axios.post('http://localhost:9000/api/admin/register', 
                { userName:userId, name },
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );
            console.log(response.data);
            const userDetails = response.data.admin;
            console.log(userDetails)
            localStorage.setItem("userDetails", JSON.stringify(userDetails));
            const role = "admin"
            localStorage.setItem("role",role);
            socket.emit("new-admin-added")
            navigate("/"); 
        } catch (err) {
            setError(err.response ? err.response.data.message : 'Registration failed');
        }
    };

    const loginAdmin = async () => {
        try {
            const response = await axios.post('http://localhost:9000/api/admin/login', { userName:userId },
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
            console.log(response.data);
            const userDetails = response.data.admin;
            console.log(userDetails)
            localStorage.setItem("userDetails", JSON.stringify(userDetails));
            const role = "admin"
            localStorage.setItem("role",role)
            socket.emit("new-admin-added")
            navigate("/"); 
        } catch (err) {
            setError(err.response ? err.response.data.message : 'Login failed');
        }
    };

   
    const registerUser = async () => {
        try {
            const response = await axios.post('http://localhost:9000/api/user/register', { userId, name },
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
            console.log(response.user);
            const userDetails = response.data.user;
            console.log(userDetails)
            localStorage.setItem("userDetails", JSON.stringify(userDetails));
            localStorage.setItem("role", "user");
            const role = "user"
            localStorage.setItem("role",role)
            navigate("/"); 
        } catch (err) {
            setError(err.response ? err.response.data.message : 'Registration failed');
        }
    };


    const loginUser = async () => {
        try {
            const response = await axios.post('http://localhost:9000/api/user/login', { userId },
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
            console.log(response.data);
            const userDetails = response.data.user;
            console.log(userDetails)
            localStorage.setItem("userDetails", JSON.stringify(userDetails));
            const role = "user"
            localStorage.setItem("role",role)
            navigate("/"); 
        } catch (err) {
            setError(err.response ? err.response.data.message : 'Login failed');
        }
    };

    return (
        <div className="h-[100vh] flex justify-center items-center">
            {currentFlow === flow.get_started && (
                <div className="h-[35vh] w-[20vw] bg-black rounded-md flex flex-col justify-center items-center">
                    <h1 className="text-white text-3xl">Get Started</h1>
                    <button className="text-white h-[40px] w-[90%] bg-blue-500 rounded my-2" onClick={() => updateCurrentFlow(flow.admin_login)}>Continue as Admin</button>
                    <button className="text-white h-[40px] w-[90%] bg-blue-500 rounded my-2" onClick={() => updateCurrentFlow(flow.user_login)}>Continue as User</button>
                </div>
            )}

            {currentFlow === flow.admin_login && (
                <div className="h-[35vh] w-[20vw] bg-black rounded-md flex flex-col justify-center items-center">
                    <h1 className="text-white text-3xl">Admin Login</h1>
                    <input placeholder="Enter user ID" className="h-[35px] mb-3" onChange={(e) => setUserId(e.target.value)} />
                    <button className="text-white h-[40px] w-[90%] bg-blue-500 rounded my-2" onClick={loginAdmin}>Login as Admin</button>
                    <button className="text-white h-[40px] w-[90%] bg-blue-500 rounded my-2" onClick={() => updateCurrentFlow(flow.admin_register_form)}>Register as Admin</button>
                    {error && <div className="text-red-500">{error}</div>}
                </div>
            )}

            {currentFlow === flow.admin_register_form && (
                <div className="h-[35vh] w-[20vw] bg-black rounded-md flex flex-col justify-center items-center">
                    <h1 className="text-white text-3xl mb-3">Register as Admin</h1>
                    <input placeholder="Enter user ID" className="h-[35px] mb-3 rounded" onChange={(e) => setUserId(e.target.value)} />
                    <input placeholder="Enter your name" className="h-[35px] mb-3 rounded" onChange={(e) => setName(e.target.value)} />
                    <button className="px-3 rounded bg-black text-white border border-white" onClick={registerAdmin}>Register</button>
                    {error && <div className="text-red-500">{error}</div>}
                </div>
            )}

            {currentFlow === flow.user_login && (
                <div className="h-[35vh] w-[20vw] bg-black rounded-md flex flex-col justify-center items-center">
                    <h1 className="text-white text-3xl">User Login</h1>
                    <input placeholder="Enter user ID" className="h-[35px] mb-3" onChange={(e) => setUserId(e.target.value)} />
                    <button className="text-white h-[40px] w-[90%] bg-blue-500 rounded my-2" onClick={loginUser}>Login as User</button>
                    <button className="text-white h-[40px] w-[90%] bg-blue-500 rounded my-2" onClick={() => updateCurrentFlow(flow.user_register_form)}>Register as User</button>
                    {error && <div className="text-red-500">{error}</div>}
                </div>
            )}

            {currentFlow === flow.user_register_form && (
                <div className="h-[35vh] w-[20vw] bg-black rounded-md flex flex-col justify-center items-center">
                    <h1 className="text-white text-3xl">Register as User</h1>
                    <input placeholder="Enter user ID" className="h-[35px] mb-3 rounded" onChange={(e) => setUserId(e.target.value)} />
                    <input placeholder="Enter your name" className="h-[35px] mb-3 rounded" onChange={(e) => setName(e.target.value)} />
                    <button className= "px-3 rounded bg-black text-white border border-white" onClick={registerUser}>Register</button>
                    {error && <div className="text-red-500">{error}</div>}
                </div>
            )}
        </div>
    );
}

export default GetStarted;
