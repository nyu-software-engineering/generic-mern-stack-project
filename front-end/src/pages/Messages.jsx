import LeaseMessaging from "../components/LeaseMessaging";
import MockConversations from "../mockConversations.js"
import ChatDashboardElement from "../components/ChatDashboardElement"
import "./Messages.css";

import { useState } from "react";

export default function Messages(){
    const [currentConversation, setCurrentConversation] = useState(null);

    if (currentConversation) {
        return (
            <LeaseMessaging
                sublessor={currentConversation.sublessor}
                subletName={currentConversation.subletName}
                onBack={() => setCurrentConversation(null)}
            />
        );
    }

    return (
        <div className="messages-page">
            <h2>Lease Messages</h2>
            <p>{MockConversations.length} leases</p>
            <ul className="conversation-list">
                {MockConversations.map((conversation) => (
                    <li key={conversation.id}>
                        <ChatDashboardElement
                            sublessor={conversation.sublessor}
                            subletName={conversation.subletName}
                            onOpen={() => setCurrentConversation(conversation)}
                        />
                    </li>
                ))}
            </ul>
        </div>
    );
}