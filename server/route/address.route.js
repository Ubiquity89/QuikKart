import express from 'express'
import { createAddress, getAddress, updateAddress, deleteAddress } from '../controllers/address.controller.js'
import auth from '../middleware/auth.js'

const router = express.Router()

router.post('/create', auth, createAddress)
router.get('/get', auth, getAddress)
router.put('/update/:id', auth, updateAddress)
router.delete('/delete/:id', auth, deleteAddress)

export default router
