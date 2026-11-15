
import React, { useEffect } from 'react'
import { Route, Routes } from 'react-router-dom'
import { useDispatch } from 'react-redux'

import Home from './pages/home'
import Layout from './pages/layout'
import Dashboard from './pages/dashboard'
import ResumeBuilder from './pages/resumeBuilder'
import Preview from './pages/preview'

import { login, setLoading } from './app/features/authSlice'
import api from './configs/api'
import { Toaster } from 'react-hot-toast'

const App = () => {
    const dispatch = useDispatch()

    const getUserData = async () => {
        const token = localStorage.getItem("token")

        try {
            if (token) {
                const { data } = await api.get("/api/users/data", {
                    headers: {
                        Authorization: token
                    }
                })

                if (data.user) {
                    dispatch(login({ token, user: data.user }))
                }
                dispatch(setLoading(false))
            } else {
                dispatch(setLoading(false))
            }
        } catch (error) {
            dispatch(setLoading(false))
            console.log(error.message)

        }
    }

    useEffect(() => {
        getUserData()
    }, [])

    return (
        <>
            <Toaster />
            <Routes>
                <Route path='/' element={<Home />} />

                <Route path='app' element={<Layout />}>
                    <Route index element={<Dashboard />} />
                    <Route
                        path='builder/:resumeId'
                        element={<ResumeBuilder />}
                    />
                </Route>

                <Route path='view/:resumeId' element={<Preview />} />
            </Routes>
        </>
    )
}

export default App
