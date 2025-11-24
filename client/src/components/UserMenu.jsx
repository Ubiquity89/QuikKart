import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import Divider from './Divider';
import Axios from '../utils/Axios';
import SummaryApi from '../common/SummaryApi';
import { logout } from '../store/userSlice';
import { clearCart } from '../store/cartProduct';
import { toast } from 'react-hot-toast';
import { HiOutlineExternalLink } from 'react-icons/hi';
import isAdmin from '../utils/isAdmin';

const UserMenu = ({close}) => {
  const user = useSelector((state) => state.user)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const handleLogout = () => {
    // 1. Clear all local storage
    localStorage.clear();
    
    // 2. Clear Redux state
    dispatch(logout());
    
    // 3. Clear cart state
    dispatch(clearCart());
    
    // 4. Close menu if open
    if (close) close();
    
    // 5. Show success message
    toast.success('Logged out successfully');
    
    // 6. Redirect to home
    navigate('/');
    
    // 7. Try to notify server in the background (don't wait for response)
    Axios({
      ...SummaryApi.logout,
      timeout: 1000
    }).catch(() => {
      // Ignore any errors
    });
  };

  const handleClose=()=>{
    if(close) {
      close()
    }
  }

  return (
    <div>
      <div className="font-semibold">My Account</div>
      <div className="text-sm flex items-center gap-2">
        <span className='max-w-52 text-ellipsis line-clamp-1'>{user.name || user.mobile}<span className="text-medium text-red-600">{user.role === "ADMIN" ? "(Admin)" : ""}</span></span>
        <Link onClick={handleClose} to={"/dashboard/profile"} className='hover: text-primary-200'>
        <HiOutlineExternalLink size={15}/>
        </Link>
        </div>
      <Divider />

      <div className="text-sm grid gap-1">
        {
          isAdmin(user.role)  && (
            
            <Link onClick={handleClose} to="/dashboard/category" className="px-2 hover:bg-orange-200 py-1">
        Category
        </Link>
           
          ) 
        }

      {
        isAdmin(user.role)  && (
          
          <Link onClick={handleClose} to="/dashboard/subcategory" className="px-2 hover:bg-orange-200 py-1">
          Sub Category
          </Link>
        )
      }
       {
          isAdmin(user.role)  && (
            
            <Link onClick={handleClose} to="/dashboard/upload-product" className="px-2 hover:bg-orange-200 py-1">
        Upload Product
        </Link>
           
          ) 
        }
        {
          isAdmin(user.role)  && (
         
           <Link onClick={handleClose} to="/dashboard/product" className="px-2 hover:bg-orange-200 py-1">
          Product
        </Link>

          ) 
        }



        
        <Link onClick={handleClose} to="/dashboard/myorders" className="px-2 hover:bg-orange-200 py-1">
          My Orders
        </Link>
        <Link onClick={handleClose} to="/dashboard/address" className="px-2 hover:bg-orange-200 py-1">
          Saved Addresses
        </Link>

        {/* ✅ Logout button */}
        <button 
          onClick={handleLogout}
          className="text-left px-2 hover:bg-orange-200 py-1"
        >
          Log Out
        </button>
      </div>
    </div>
  )
}

export default UserMenu
