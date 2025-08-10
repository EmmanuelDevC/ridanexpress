import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Heders from '../components/Headers'
import Banner from '../components/Banner'
import Categorys from '../components/Categorys'
import FeatureProducts from '../components/products/FeatureProducts'
import Products from '../components/products/Products'
import Footer from '../components/Footer'
import { get_category, get_products } from '../store/reducers/homeReducer'
import BottomNav from '../components/BottomNav'
const Home = () => {

    const dispatch = useDispatch()

    const { products,
        // latest_product,
        // topRated_product,
        // discount_product
    } = useSelector(state => state.home)

    useEffect(() => {
        dispatch(get_products())
    }, [])

    return (
        <div style={{ overflowX: "hidden" }} className='w-full bg-slate-100 '>
            <Heders />
            <div className='mt-[4.5rem] px- lg:mt-[9rem]'>
                <div className='max-w-[1440px] mx-auto px-1'>
                    <Banner />
                </div>
                <div className=' max-w-[1440px] mx-auto px-2 sm:px-5 md:px-10'>
                    <Categorys />
                </div>
                <div className='max-w-[1440px] mx-auto'>
                    <FeatureProducts products={products} />
                </div>
            </div>
            {/* <div className='py-10'>
                <div className='max-w-[1440px] mx-auto px-16 sm:px-5 md-lg:px-12 md:px-10 flex flex-wrap'>
                    <div className="grid w-full grid-cols-3 md-lg:grid-cols-2 md:grid-cols-1 gap-7">
                        <div className='overflow-hidden'>
                            <Products title='Latest Product' products={latest_product} />
                        </div>
                        <div className='overflow-hidden'>
                            <Products title='Top Rated Product' products={topRated_product} />
                        </div>
                        <div className='overflow-hidden'>
                            <Products title='Discount Product' products={discount_product} />
                        </div>
                    </div>
                </div>
            </div> */}
            <div className='block lg:hidden'>
                <BottomNav />
            </div>
            <div className='hidden lg:block'>
                <Footer />
            </div>
        </div>
    )
}

export default Home