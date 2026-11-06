import { Link, useNavigate } from "react-router-dom";

// Placeholder page for stakeholder demos
const Beginner = () => {
    const navigate = useNavigate();
    return(
        <div className="min-h-screen bg-white">
            <header className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
            <h2 className="text-xl font-bold text-purple-600">Jargonot</h2>
            <a
            className="font-semibold text-purple-600 hover:underline"
            href="/dashboard"
            >
            My Dashboard
            </a>
            </header>
            <button onClick = {() => navigate("/article")}
                className="w-full mt-4 bg-gray-600 text-white py-3 rounded-lg font-semibold p-3 hover:bg-gray-700">
                Original Article
            </button>
            <button onClick = {() => navigate("/dejargoned/intermediate")}
                className="w-full mt-4 bg-gray-600 text-white py-3 rounded-lg font-semibold p-3 hover:bg-gray-700">
                Intermediate
            </button>
            <p className = "text-2xl font-bold mt-4 mb-2">
                1. What happened?
                <div className = "text-base font-thin m-10">
                    <p>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas mi diam, accumsan commodo urna a, posuere blandit dolor. Fusce bibendum dapibus nisi, vitae accumsan nisi aliquet ut. Quisque venenatis ex libero, vel vehicula lorem molestie in. Nullam dapibus rhoncus nibh, eget lacinia ante fermentum nec. Integer porta, massa id suscipit ullamcorper, metus massa luctus purus, at laoreet est tellus nec augue. Phasellus eu nulla laoreet, ornare nibh et, viverra velit. Aliquam lacus arcu, sollicitudin id aliquet a, mattis sed ipsum. Quisque eget mi non mauris condimentum lacinia vel ut arcu. Praesent scelerisque leo et ex malesuada gravida. Pellentesque vel urna sem. Duis porta dui felis, porttitor efficitur magna convallis cursus. Aliquam erat velit, blandit id sagittis nec, ultricies vel augue. Sed non viverra magna, sit amet euismod ligula. Ut lacinia volutpat velit vel mollis. Suspendisse sodales ligula neque, sed faucibus lectus volutpat ac. Mauris suscipit enim ipsum, sed condimentum lectus convallis eget.
                    </p>
                </div>
            </p>
            <p className = "text-2xl font-bold mt-4 mb-2">
                2. Why does it matter?
                <div className = "text-base font-thin m-10">
                    <p>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas mi diam, accumsan commodo urna a, posuere blandit dolor. Fusce bibendum dapibus nisi, vitae accumsan nisi aliquet ut. Quisque venenatis ex libero, vel vehicula lorem molestie in. Nullam dapibus rhoncus nibh, eget lacinia ante fermentum nec. Integer porta, massa id suscipit ullamcorper, metus massa luctus purus, at laoreet est tellus nec augue. Phasellus eu nulla laoreet, ornare nibh et, viverra velit. Aliquam lacus arcu, sollicitudin id aliquet a, mattis sed ipsum. Quisque eget mi non mauris condimentum lacinia vel ut arcu. Praesent scelerisque leo et ex malesuada gravida. Pellentesque vel urna sem. Duis porta dui felis, porttitor efficitur magna convallis cursus. Aliquam erat velit, blandit id sagittis nec, ultricies vel augue. Sed non viverra magna, sit amet euismod ligula. Ut lacinia volutpat velit vel mollis. Suspendisse sodales ligula neque, sed faucibus lectus volutpat ac. Mauris suscipit enim ipsum, sed condimentum lectus convallis eget.
                    </p>
                </div>
            </p>
            
        </div>
    )
}

export default Beginner;