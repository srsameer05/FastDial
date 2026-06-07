import Footer from "../../User/Footer";
import image from "../../../assets/image.png"; 

const ImageGallery = ({ images }) => {
  return (
    <div>
      <div className="w-[90%] mx-auto">
        <h2 className="text-xl font-semibold mb-4">Images ({images.length})</h2>

        <div className="grid grid-cols-3 gap-4">
          {images.map((image, index) => (
            <img
              key={index}
              src={image}
              alt={`Service ${index + 1}`}
              className="w-full h-[340px] object-cover rounded-lg" // Updated h-85 to h-[340px]
              onError={(e) => {
                console.log(`Gallery image failed to load: ${e.target.src}`);
                e.target.src = image; // Fallback to image.png
              }}
            />
          ))}
        </div>
      </div>
      <div className="pt-5">
        <Footer />
      </div>
    </div>
  );
};

export default ImageGallery;