import ListingCard from "../components/ListingCard";
import "../styles/App.css";


export default function Homepage (){

    const testListing = {
        title: "Brooklyn Apartment",
        location: "Williamsburg, Brooklyn",
        price: "$1,650",
        roommates: 2,
        image: "/images/sublet-sample-apartment.webp"
    };

    return (
        <div className = "app">
            <h2>Explore Sublets</h2>
            <ListingCard listing={testListing} />
        </div>
    );
    
}