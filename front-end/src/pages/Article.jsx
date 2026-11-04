import { Link, useNavigate } from "react-router-dom";

// Placeholder page for stakeholder demos
const Article = () => {
    const navigate = useNavigate();
    return(
        <div className = "m-10">
            <button onClick = {() => navigate("/De-Jargoned")}
                className="w-full mt-4 bg-gray-600 text-white py-3 rounded-lg font-semibold p-3 hover:bg-gray-700">
                De-Jargoned
            </button>
            <p className = "text-base mt-4">
                TOPIC | PUBLICATION
            </p>
            <h1 className = "text-3xl font-bold mb-2">
                Lorem Ipsum
            </h1>
            <p className = "text-base mb-4">
                AUTORED BY PETER MOJANG
            </p>
            <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas mi diam, accumsan commodo urna a, posuere blandit dolor. Fusce bibendum dapibus nisi, vitae accumsan nisi aliquet ut. Quisque venenatis ex libero, vel vehicula lorem molestie in. Nullam dapibus rhoncus nibh, eget lacinia ante fermentum nec. Integer porta, massa id suscipit ullamcorper, metus massa luctus purus, at laoreet est tellus nec augue. Phasellus eu nulla laoreet, ornare nibh et, viverra velit. Aliquam lacus arcu, sollicitudin id aliquet a, mattis sed ipsum. Quisque eget mi non mauris condimentum lacinia vel ut arcu. Praesent scelerisque leo et ex malesuada gravida. Pellentesque vel urna sem. Duis porta dui felis, porttitor efficitur magna convallis cursus. Aliquam erat velit, blandit id sagittis nec, ultricies vel augue. Sed non viverra magna, sit amet euismod ligula. Ut lacinia volutpat velit vel mollis. Suspendisse sodales ligula neque, sed faucibus lectus volutpat ac. Mauris suscipit enim ipsum, sed condimentum lectus convallis eget.

                Maecenas porta, arcu at congue pretium, magna tortor imperdiet velit, vitae posuere nulla est ullamcorper lorem. Donec felis erat, condimentum in odio non, eleifend fringilla eros. Integer pharetra commodo turpis, vitae venenatis felis pretium quis. Mauris sed risus nisi. Suspendisse aliquet placerat velit vel auctor. Nulla non elit non tortor finibus sagittis in at augue. Donec lorem sapien, ultricies a consequat quis, dignissim sed orci. Vivamus et sapien erat. Aliquam placerat accumsan arcu, nec vulputate justo placerat sit amet. Nam odio nisi, maximus eget ornare nec, gravida non risus. Fusce ante leo, varius nec sapien auctor, gravida pulvinar diam. Morbi efficitur, nunc a venenatis malesuada, magna tortor tempor diam, sit amet varius tellus magna in sapien. Suspendisse vestibulum leo eu tempus lacinia.

                Praesent lacinia vestibulum justo eget venenatis. Sed in tincidunt erat. Integer finibus auctor rutrum. Quisque mattis egestas est quis tristique. Nullam in varius ex. Pellentesque laoreet dictum mi, id posuere dolor imperdiet eu. Cras nec diam mi. Curabitur tempus mauris in mauris ornare fermentum. Phasellus laoreet nulla et nulla rhoncus, non convallis sapien placerat. Vivamus cursus eleifend massa, quis lacinia ex volutpat nec. Vivamus volutpat pharetra bibendum. Etiam ac turpis sit amet justo congue cursus sit amet sit amet velit.

                Aenean tempor, nisl at elementum facilisis, risus augue fermentum sem, non varius lacus purus quis velit. Aenean ut ex ut metus facilisis auctor a quis augue. Cras eu imperdiet ex, sed gravida ex. Vestibulum pharetra tellus urna, sed pulvinar nisl placerat id. Donec eu faucibus massa, sed auctor ipsum. Nam lobortis dui nulla, nec faucibus ex viverra ac. Curabitur molestie id arcu et tincidunt. Nulla facilisi.

                Suspendisse vel purus odio. Maecenas placerat egestas nisi at luctus. Phasellus eu nulla mi. Donec accumsan ex vel purus fringilla cursus. Vestibulum at dapibus ante. Ut in libero enim. Duis tincidunt eget ante ac vehicula. Ut non quam convallis, porttitor lectus non, malesuada ipsum. Phasellus quis magna eu eros euismod pretium. Aliquam est turpis, posuere ut sem nec, interdum lobortis mi. Sed feugiat sapien id velit gravida eleifend quis semper sapien. Donec eu convallis arcu. Nam at quam iaculis, lobortis lacus in, imperdiet est. Donec fringilla maximus elit.
            </p>
        </div>
    )
}

export default Article;