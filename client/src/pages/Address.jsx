import React, { useEffect, useState } from 'react'
import Axios from '../utils/Axios'
import AxiosToastError from '../utils/AxiosToastError'
import SummaryApi from '../common/SummaryApi'
import { useSelector } from 'react-redux'
import { FaPlus, FaEdit, FaTrash, FaMapMarkerAlt } from 'react-icons/fa'
import AddressForm from '../components/AddressForm'
import toast from 'react-hot-toast'

const Address = () => {
  const user = useSelector(state => state.user)
  const [addresses, setAddresses] = useState([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingAddress, setEditingAddress] = useState(null)

  const fetchAddresses = async () => {
    try {
      setLoading(true)
      const response = await Axios({
        ...SummaryApi.getAddress
      })
      
      if (response.data.success) {
        setAddresses(response.data.data)
      }
    } catch (error) {
      AxiosToastError(error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (addressId) => {
    if (window.confirm('Are you sure you want to delete this address?')) {
      try {
        const response = await Axios({
          ...SummaryApi.deleteAddress,
          url: SummaryApi.deleteAddress.url.replace(':id', addressId)
        })
        
        if (response.data.success) {
          toast.success(response.data.message)
          fetchAddresses()
        }
      } catch (error) {
        AxiosToastError(error)
      }
    }
  }

  const handleEdit = (address) => {
    setEditingAddress(address)
    setShowForm(true)
  }

  const handleAddNew = () => {
    setEditingAddress(null)
    setShowForm(true)
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingAddress(null)
  }

  const handleFormSuccess = () => {
    fetchAddresses()
  }

  useEffect(() => {
    if (user?._id) {
      fetchAddresses()
    }
  }, [user])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">My Addresses</h2>
        <button 
          onClick={handleAddNew}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition duration-200"
        >
          <FaPlus />
          Add New Address
        </button>
      </div>

      {addresses.length === 0 ? (
        <div className="text-center py-12">
          <FaMapMarkerAlt className="mx-auto text-gray-300 text-5xl mb-4" />
          <p className="text-gray-500 text-lg">No addresses found</p>
          <p className="text-gray-400 mt-2">Add your first address to get started</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {addresses.map((address) => (
            <div key={address._id} className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition duration-200">
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-semibold text-lg text-gray-800">
                  {address.address_type || 'Home'}
                </h3>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleEdit(address)}
                    className="text-blue-500 hover:text-blue-700 transition duration-200"
                  >
                    <FaEdit />
                  </button>
                  <button 
                    onClick={() => handleDelete(address._id)}
                    className="text-red-500 hover:text-red-700 transition duration-200"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
              
              <div className="space-y-2 text-gray-600">
                <p className="font-medium">{address.name}</p>
                <p>{address.mobile}</p>
                <p className="text-sm">{address.address_line}</p>
                <p className="text-sm">
                  {address.city}, {address.state} - {address.pincode}
                </p>
                {address.country && (
                  <p className="text-sm">{address.country}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <AddressForm 
          address={editingAddress}
          onClose={handleCloseForm}
          onSuccess={handleFormSuccess}
        />
      )}
    </div>
  )
}

export default Address
