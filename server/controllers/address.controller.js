import AddressModel from '../models/address.model.js'

export const createAddress = async (request, response) => {
    try {
        const userId = request.userId

        const { address_line, city, state, country, pincode, mobile } = request.body

        if (!address_line || !city || !state || !country || !pincode || !mobile) {
            return response.status(400).json({
                message: "Please provide all required fields",
                error: true,
                success: false
            })
        }

        const address = new AddressModel({
            address_line,
            city,
            state,
            country,
            pincode,
            mobile
        })

        const saveAddress = await address.save()

        return response.json({
            message: "Address created successfully",
            data: saveAddress,
            error: false,
            success: true
        })

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

export const getAddress = async (request, response) => {
    try {
        const userId = request.userId

        const address = await AddressModel.find().sort({ createdAt: -1 })

        return response.json({
            data: address,
            error: false,
            success: true
        })

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

export const updateAddress = async (request, response) => {
    try {
        const { id } = request.params
        const userId = request.userId
        const { address_line, city, state, country, pincode, mobile } = request.body

        if (!address_line || !city || !state || !country || !pincode || !mobile) {
            return response.status(400).json({
                message: "Please provide all required fields",
                error: true,
                success: false
            })
        }

        const updatedAddress = await AddressModel.findByIdAndUpdate(
            id,
            { address_line, city, state, country, pincode, mobile },
            { new: true }
        )

        if (!updatedAddress) {
            return response.status(404).json({
                message: "Address not found",
                error: true,
                success: false
            })
        }

        return response.json({
            message: "Address updated successfully",
            data: updatedAddress,
            error: false,
            success: true
        })

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

export const deleteAddress = async (request, response) => {
    try {
        const { id } = request.params
        const userId = request.userId

        const deletedAddress = await AddressModel.findByIdAndDelete(id)

        if (!deletedAddress) {
            return response.status(404).json({
                message: "Address not found",
                error: true,
                success: false
            })
        }

        return response.json({
            message: "Address deleted successfully",
            error: false,
            success: true
        })

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}
