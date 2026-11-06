import { Link, useNavigate } from "react-router-dom";

// Placeholder page for stakeholder demos
export default function Beginner() {
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

            <main className="mx-auto w-full max-w-4xl px-6 py-10">
                <div className="flex-1 mb-4 grid grid-cols-2">
                    <button onClick = {() => navigate("/article")}
                        className="bg-purple-600 text-white py-3 font-semibold hover:bg-purple-700">
                        Original
                    </button>
                    <button onClick = {() => navigate("/dejargoned/beginner")}
                        className="bg-gray-600 text-white py-3 font-semibold">
                        De-Jargoned
                    </button>
                </div>

                <p className = "text-left text-sm font-medium mt-6 uppercase text-gray-600">
                TOPIC | PUBLICATION
                </p>
                <p className="text-left text-3xl font-bold mb-4">
                    Lorem Ipsum
                </p>

                <div className="mt-4 flex items-center gap-4">
                    <p className="flex-1 text-md font-medium">
                        Explanation Level
                    </p>

                    <div className="flex-1 grid grid-cols-2">
                        <button onClick = {() => navigate("/dejargoned/beginner")}
                            className="bg-gray-600 text-white px-5 font-semibold">
                            Beginner
                        </button>
                        <button onClick = {() => navigate("/dejargoned/intermediate")}
                            className="bg-purple-600 text-white px-5 font-semibold hover:bg-purple-700">
                            Intermediate
                        </button>
                    </div>
                </div>

                <section className="grid grid-rows-3 gap-4 border border-gray-300 m-4 text-black">
                    <div>
                        <p className = "text-2xl font-bold m-6">
                            1. What happened?
                        </p>
                        <p className = "text-base font-normal m-2">
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas mi diam, accumsan commodo urna a, posuere blandit dolor. Fusce bibendum dapibus nisi, vitae accumsan nisi aliquet ut. Quisque venenatis ex libero, vel vehicula lorem molestie in. Nullam dapibus rhoncus nibh, eget lacinia ante fermentum nec. Integer porta, massa id suscipit ullamcorper, metus massa luctus purus, at laoreet est tellus nec augue. Phasellus eu nulla laoreet, ornare nibh et, viverra velit. Aliquam lacus arcu, sollicitudin id aliquet a, mattis sed ipsum. Quisque eget mi non mauris condimentum lacinia vel ut arcu. Praesent scelerisque leo et ex malesuada gravida. Pellentesque vel urna sem. Duis porta dui felis, porttitor efficitur magna convallis cursus. Aliquam erat velit, blandit id sagittis nec, ultricies vel augue. Sed non viverra magna, sit amet euismod ligula. Ut lacinia volutpat velit vel mollis. Suspendisse sodales ligula neque, sed faucibus lectus volutpat ac. Mauris suscipit enim ipsum, sed condimentum lectus convallis eget.
                        </p>
                    </div>
                    <div>
                        <p className = "text-2xl font-bold m-6">
                            2. Why does it matter?
                        </p>
                        <p className = "text-base font-normal m-2">
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas mi diam, accumsan commodo urna a, posuere blandit dolor. Fusce bibendum dapibus nisi, vitae accumsan nisi aliquet ut. Quisque venenatis ex libero, vel vehicula lorem molestie in. Nullam dapibus rhoncus nibh, eget lacinia ante fermentum nec. Integer porta, massa id suscipit ullamcorper, metus massa luctus purus, at laoreet est tellus nec augue. Phasellus eu nulla laoreet, ornare nibh et, viverra velit. Aliquam lacus arcu, sollicitudin id aliquet a, mattis sed ipsum. Quisque eget mi non mauris condimentum lacinia vel ut arcu. Praesent scelerisque leo et ex malesuada gravida. Pellentesque vel urna sem. Duis porta dui felis, porttitor efficitur magna convallis cursus. Aliquam erat velit, blandit id sagittis nec, ultricies vel augue. Sed non viverra magna, sit amet euismod ligula. Ut lacinia volutpat velit vel mollis. Suspendisse sodales ligula neque, sed faucibus lectus volutpat ac. Mauris suscipit enim ipsum, sed condimentum lectus convallis eget.
                        </p>
                    </div>
                    <div>
                        <p className = "text-2xl font-bold m-6">
                            3. What terms should I know? 
                        </p>
                        <p className = "text-base font-normal m-2">
                            Ipsum - sit amet consectetur adipiscing elit.
                        </p>
                    </div>
                </section>
            </main>
        </div>
    )
} 