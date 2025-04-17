import React, { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import FadeLoader from 'react-spinners/FadeLoader'
import axios from 'axios'
import error from '../assets/error.png'
import success from '../assets/success.png'
import { api_url } from '../utils/config'

const ConfirmOrder = () => {
    const [loader, setLoader] = useState(true)
    const [message, setMessage] = useState(null)
    const location = useLocation()
    const dispatch = useDispatch();


    const verifyPayment = async () => {
        const orderId = localStorage.getItem('orderId')
        const urlParams = new URLSearchParams(location.search)
        const transaction_id = urlParams.get('transaction_id')

        if (!orderId || !transaction_id) {
            setMessage('failed')
            return
        }

        try {
            await axios.post(
                `${api_url}/api/order/confirm/${orderId}`,
                { transaction_id },
                { withCredentials: true }
            )

            localStorage.removeItem('orderId')
            setMessage('succeeded')
            setLoader(false)
        } catch (error) {
            console.error('Payment verification error:', error.response?.data)
            setMessage('failed')
            setLoader(false)
        }
    }

    useEffect(() => {
        const initializeVerification = async () => {
            try {
                await verifyPayment()
            } catch (error) {
                setMessage('failed')
                setLoader(false)
            }
        }

        initializeVerification()
    }, [])

    useEffect(() => {
        if (message === 'succeeded') {
            dispatch(get_orders({
                status: 'all',
                customerId: userInfo.id
            }))
        }
    }, [message])

    return (
        <div className='w-screen h-screen flex justify-center items-center flex-col gap-4'>
            {message === 'failed' ? (
                <>
                    <img src={error} alt="Payment error" className='w-32 h-32' />
                    <Link
                        className='px-5 py-2 bg-green-500 rounded-sm text-white hover:bg-green-600 transition-colors'
                        to='/dashboard/my-orders'
                    >
                        Back to Dashboard
                    </Link>
                </>
            ) : message === 'succeeded' ? (
                loader ? (
                    <FadeLoader color="#36d7b7" />
                ) : (
                    <>
                        <img src={success} alt="Payment success" className='w-32 h-32' />
                        <Link
                            className='px-5 py-2 bg-green-500 rounded-sm text-white hover:bg-green-600 transition-colors'
                            to='/dashboard/my-orders'
                        >
                            Back to Dashboard
                        </Link>
                    </>
                )
            ) : (
                <FadeLoader color="#36d7b7" />
            )}
        </div>
    )
}

export default ConfirmOrder