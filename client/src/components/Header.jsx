import React, { useState } from 'react'
import logo from '../assets/logo.png'
import Search from './Search'
import { Link, useNavigate } from 'react-router-dom'
import { FaRegCircleUser } from 'react-icons/fa6'
import useMobile from '../hooks/useMobile'
import { useLocation } from 'react-router-dom'
import { BsCart4 } from 'react-icons/bs'
import { useSelector } from 'react-redux'
import { GoTriangleDown, GoTriangleUp } from 'react-icons/go'
import { useGlobalContext } from '../provider/GlobalProvider'
import UserMenu from './UserMenu'
import { DisplayPriceInRupees } from '../utils/DisplayPriceInRupees.js'
import DisplayCartItem from './DisplayCartItem'

const Header = () => {
const { totalQty, totalPrice } = useGlobalContext()
const [isMobile] = useMobile()
const location = useLocation()
const isSearchPage= location.pathname === "/search"
const navigate = useNavigate()
const user = useSelector((state)=>state?.user)
const [openUserMenu,setOpenUserMenu] = useState(false)
const cartProduct = useSelector((state)=>state?.cartItem?.cart)
const [openCartMenu,setOpenCartMenu] = useState(false)

const redirectToLoginPage = ()=>{
    navigate("/login")
}

const handleCloseUserMenu = () => {
  setOpenUserMenu(false)
}

 const handleMoblieUser = () => {
  if(!user._id){
    navigate("/login")
    return
  }
  navigate("/user")
 }

  return (
   <header className='h-24 lg:h-20 shadow-md sticky top-0 z-40 flex items-center flex-col justify-center gap-1 bg-white'>
    {
      !(isSearchPage && isMobile) && (

    <div className='container mx-auto flex items-center px-2 justify-between'>
      {/*logo*/}
    <div className='h-full flex items-center'>
        <Link to="/" className='h-full flex items-center pl-4 pr-6'>
            <div className='h-full flex items-center'>
              <h1 className='text-3xl md:text-4xl font-extrabold tracking-tight'>
                <span className='text-yellow-400 font-sanssss'>Quick</span>
                <span className='text-green-600 font-serif'>Kart</span>
              </h1>
            </div>
        </Link>
    </div>
    {/*search*/}
    <div className='hidden lg:block'>
      <Search/>
    </div>


    {/*login and my cart*/}

    <div className=''>
      {/*mobile*/}
       <button className='text-neutral-600 lg:hidden' onClick={handleMoblieUser}>
          <FaRegCircleUser size={26}/>
      </button>
      {/*desktop*/}
      <div className='hidden lg:flex items-center gap-10'>
        {
          user?._id? (
            <div className='relative'>
              <div onClick={()=>setOpenUserMenu(preve=>!preve)} className='flex select-none items-center gap-1 cursor-pointer'>
                <p>Account</p>
                {
                openUserMenu?(
                  <GoTriangleUp size={25}/>

                ) :(
                  <GoTriangleDown size={25}/>

                )
              }
              </div>
              {
                openUserMenu && (
                  <div className='absolute right-0 top-12'>
                 <div className='bg-white rounded p-4 min-w-52 lg:shadow-lg'>
                  <UserMenu close={handleCloseUserMenu}/>
                </div>
                </div>
                )
              }
                
            </div>
          ) : (

        <button onClick={redirectToLoginPage} className='text-lg px-2'>
          Login
        </button>
          )
        }
        <button onClick={()=>setOpenCartMenu(true)} className='flex items-center gap-2 bg-green-700 px-2 py-1 rounded text-white'>
          {/**add to card icons */}
          <div className='animate-bounce'>
              <BsCart4 size={26}/>
          </div>
          <div className='font-semibold text-sm'>
            {
              cartProduct && cartProduct[0] ? (
                <div>
                    <p>{totalQty} Items</p>
                    <p>{DisplayPriceInRupees(totalPrice)}</p>
                </div>
              ): (

                <p>My Cart</p>
              )
            }
          </div>
        </button>
      </div>
    </div>

    </div>

      )
    }

<div className='container mx-auto px-2 lg:hidden'>
  <Search/>
</div>

{
    openCartMenu && (
        <DisplayCartItem close={()=>setOpenCartMenu(false)}/>
    )
}
   </header>
  )
}

export default Header
