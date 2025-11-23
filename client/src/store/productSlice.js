import { createSlice } from "@reduxjs/toolkit";

const initialValue = {
    allCategory : [],
    loadingCategory: true,
    loadingSubCategory: true,
    allSubCategory : [],
    product : [],
    error: null
}

const productSlice = createSlice({
    name : 'product',
    initialState : initialValue,
    reducers : {
        setAllCategory : (state,action)=>{
            state.allCategory = [...action.payload]
            state.loadingCategory = false
            state.error = null
        },
        setLoadingCategory : (state,action)=>{
            state.loadingCategory = action.payload
        },
        setAllSubCategory : (state,action)=>{
            state.allSubCategory = [...action.payload]
            state.loadingSubCategory = false
            state.error = null
        },
        setError: (state, action) => {
            state.error = action.payload
            state.loadingCategory = false
            state.loadingSubCategory = false
        },
        
    }
})

export const  { 
    setAllCategory, 
    setAllSubCategory, 
    setLoadingCategory, 
    setError 
} = productSlice.actions

export default productSlice.reducer