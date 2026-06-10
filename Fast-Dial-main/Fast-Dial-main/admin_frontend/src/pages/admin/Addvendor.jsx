import React from 'react';
import NevbarMain from '../../components/NevbarMain';
import SideNevbar from '../../components/SideNevBar';

function Addvendor() {
  return (
    <>
      <NevbarMain />
      <div className='flex h-screen'>
        <SideNevbar />
        <div className='p-10 pt-7 ml-[20px] text-2xl font-Lato'>
          <h2 className='text-2xl font-bold mb-4'>Add Vendor</h2>
          <div className='bg-white p-4 shadow-md h-[453px] overflow-y-auto'>
            <form className='grid grid-cols-2 gap-6 pb-16'>
              <h3 className='col-span-2 text-xl font-semibold text-blue-500 mb-[10px]'>Vendor Details</h3>
              
              <div>
                <label htmlFor="firstName" className='block text-lg text-gray-600'>First Name</label>
                <input type="text" id="firstName" name="firstName" className='w-full border p-2 rounded' required />
              </div>
              
              <div>
                <label htmlFor="lastName" className='block text-lg text-gray-600'>Last Name</label>
                <input type="text" id="lastName" name="lastName" className='w-full border p-2 rounded' required />
              </div>

              <div>
                <label htmlFor="email" className='block text-lg text-gray-600'>Email</label>
                <input type="email" id="email" name="email" className='w-full border p-2 rounded' required />
              </div>
              
              <div>
                <label htmlFor="mobile" className='block text-lg text-gray-600'>Mobile Number</label>
                <input type="tel" id="mobile" name="mobile" className='w-full border p-2 rounded' required />
              </div>

              <h3 className='col-span-2 text-xl font-semibold text-blue-500 mb-[10px] mt-[40px]'>Business Details</h3>
              
              <div>
                <label htmlFor="businessName" className='block text-lg text-gray-600'>Name of the Business</label>
                <input type="text" id="businessName" name="businessName" className='w-full border p-2 rounded' required />
              </div>
              
              <div>
                <label htmlFor="serviceCategory" className='block text-lg text-gray-600'>Service Category</label>
                <input type="text" id="serviceCategory" name="serviceCategory" className='w-full border p-2 rounded' required />
              </div>

              <div>
                <label htmlFor="serviceCategory" className='block text-lg text-gray-600'>Sub Category</label>
                <input type="text" id="serviceCategory" name="serviceCategory" className='w-full border p-2 rounded' required />
              </div>

              <div>
                <label htmlFor="serviceCategory" className='block text-lg text-gray-600'>Service Proof</label>
                <input type="text" id="serviceCategory" name="serviceCategory" className='w-full border p-2 rounded' required />
              </div>

              <div>
                <label htmlFor="serviceName" className='block text-lg text-gray-600'>Service Name</label>
                <input type="text" id="serviceName" name="serviceName" className='w-full border p-2 rounded' required />
              </div>
              
              <div>
                <label htmlFor="serviceRadius" className='block text-lg text-gray-600'>Service Radius (in km)</label>
                <input type="number" id="serviceRadius" name="serviceRadius" className='w-full border p-2 rounded' required />
              </div>
  
              <div>
                <label htmlFor="serviceRadius" className='block text-lg text-gray-600'>Business Details</label>
                <input type="text" id="serviceRadius" name="serviceRadius" className='w-full border p-2 rounded' required />
              </div>

              <div>
                <label htmlFor="pincode" className='block text-lg text-gray-600'>Pincode</label>
                <input type="text" id="pincode" name="pincode" className='w-full border p-2 rounded' required />
              </div>

              <div>
                <label htmlFor="startTime" className='block text-lg text-gray-600'>Starting Time</label>
                <input type="time" id="startTime" name="startTime" className='w-full border p-2 rounded' required />
              </div>

              <div>
                <label htmlFor="closingTime" className='block text-lg text-gray-600'>Closing Time</label>
                <input type="time" id="closingTime" name="closingTime" className='w-full border p-2 rounded' required />
              </div>

              <div className='col-span-2'>
                <label htmlFor="description" className='block text-lg text-gray-600'>Description</label>
                <textarea id="description" name="description" rows="4" className='w-full border p-2 rounded' required></textarea>
              </div>

              <div>
                <label htmlFor="photoUpload" className='block text-lg text-gray-600'>Upload Photo</label>
                <input type="file" id="photoUpload" name="photoUpload" accept="image/*" className='w-full border p-2 rounded' required />
              </div>
            </form>
          </div>
          <div className='relative p-4 shadow-md bg-white '>
            <button type="submit" className='bg-blue-500 text-white px-6 py-2 ml-[80%] rounded-lg shadow-md hover:bg-blue-600'>Add Vendor</button>
          </div>
        </div>
      </div>
    </>
  );
}

export default Addvendor;