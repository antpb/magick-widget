const { render } = wp.element;
import React, { useState, useEffect } from "react";
import ScrollableFeed from 'react-scrollable-feed'

function isMobile() {
	return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

function ChatBox(props) {
	const [messages, setMessages] = useState();

	const handleChange = async (event) => {
		event.preventDefault();
		event.stopPropagation();
	};

	useEffect(() => {
		let finalDefault = props.name + ': ' + props.defaultMessage;
		setMessages([finalDefault]);
	},[])

	const handleSubmit = async (event) => {
		event.preventDefault();

	// Get the value of the input element
	const input = event.target.elements.message;
	const value = input.value;
	const inputMessageLog = props.userId + ": " + String(input.value);
	//   setMessages([...messages, inputMessageLog]);
	input.value = '';


	const speaker = props.userId;
	const agent = props.name;

	try {
		let finalPersonality = props.personality;
		const someData = {
			agentRoute: props.agentRoute,
			id: props.agentId,
			speaker: value,
			speakerName: speaker,
			agentName: agent,
			personality: finalPersonality
		};
		console.log("someData: ", someData)
		const postData = {
			content: JSON.stringify(someData),
			id: props.agentId,
		};
		console.log("nonce: " + props.nonce)
		const response = await fetch('/wp-json/wp/v2/callAI', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'X-WP-Nonce': props.nonce,
				'Authorization': ('Bearer ' + String(props.nonce))
			},
			body: JSON.stringify(postData)
			}).then((response) => {
				return response.json();
			}).then(function(data) {
				let thisMessage = JSON.parse(data);
				if(thisMessage?.model === "gpt-3.5-turbo-0301"){
					let formattedMessage = props.name +': ' + Object.values(thisMessage.choices)[0].message.content;
					setMessages([...messages, inputMessageLog, formattedMessage]);
				} else {
					if(thisMessage?.result?.outputs){
						let formattedMessage = props.name +': ' + Object.values(thisMessage.result.outputs)[0];
						setMessages([...messages, inputMessageLog, formattedMessage]);
					} else if(thisMessage?.name === "Server"){
						let formattedMessage = thisMessage.name +': ' + thisMessage.message;
						setMessages([...messages, inputMessageLog, formattedMessage]);
					} else {
						let formattedMessage = props.name +': ' + thisMessage.davinciData.choices[0].text;
						// add formattedMessage and inputMessageLog to state
						setMessages([...messages, inputMessageLog, formattedMessage]);	
					}
				}
			});	
		} catch (error) {
			console.error(error);
		}
	};

	const ClickStop = ({ children }) => {
		return <div onClick={e => {
			e.stopPropagation()
		}}>
			{children}
		</div>;
	};

	const [open, setOpen] = useState(false);
	const onSwitch = (e) => {
		e.preventDefault();
		e.stopPropagation();	
		setOpen(prevOpen => !prevOpen);
	};
				
	if(isMobile()){
	return (
		<>
		<button className="magick-chat-button" onClick={onSwitch}>Chat</button>
		{open && (
			<ClickStop>
					<button className="magick-chat-button" onClick={onSwitch}>Close</button>
					<div className="magick-chat-container" style={{ pointerEvents: "auto", position: "relative", paddingTop: "14px", paddingLeft: "5px", paddingRight: "5px", overflyY: "scroll", paddingBottom: "5px", boxSizing: "border-box", zIndex:100, marginTop: "0px", width: "300px", height: "280px", fontSize: ".8em", color: "#FFFFFF", bottom: "0", left: "2%", backgroundColor: "transparent"}}>
						<div style={{pointerEvents: "auto", position: "relative", paddingTop: "14px", paddingLeft: "5px", paddingRight: "5px", overflyY: "scroll", paddingBottom: "5px", boxSizing: "border-box", zIndex:100, width: "275px", maxHeight: "250px", height: "250px", fontSize: "0.8em", color: "#FFFFFF", backgroundColor: "#"}}>
							<ScrollableFeed>
								<ul style={{paddingLeft: "0px", marginLeft: "5px", listStyle: "none"}}>
									{ props.showUI && messages && messages.length > 0 && messages.map((message, index) => (
										<li style={{background: "#000000db", borderRadius: "30px", padding: "10px 20px"}} key={index}>{message}</li>
									))}
								</ul>
							</ScrollableFeed>
						</div>
							<div style={{ width: "100%", height: "5%", position: "relative", bottom: "0px", boxSizing: "border-box", padding: "15px", paddingLeft: "7px" }}>
							{/* {messages.map((message, index) => (
							<p key={index}>{message}</p>
							))} */}
							<form style={{display: "flex"}} onSubmit={handleSubmit}>
								<input style={{height: "30px", pointerEvents: "auto", borderTopLeftRadius: "15px", borderBottomLeftRadius: "15px", borderTopRightRadius: "0px", borderBottomRightRadius: "0px"} } type="text" name="message" onInput={handleChange} onChange={handleChange} onfocus={(e) => { e.preventDefault()} }/>
								<button className="magick-chat-button-send" style={{ height: "30px", background: "#9100ff", color: "white", fontSize: ".9em", lineHeight: ".3em", borderTopRightRadius: "15px", borderBottomRightRadius: "15px", borderTopLeftRadius: "0px", borderBottomLeftRadius: "0px"} } type="submit">Send</button>
							</form>
						</div>
					</div>
			</ClickStop>
		)}
		</>
	);
	} else {
		return (
			<>
				<ClickStop>
						<div style={{pointerEvents: "auto", position: "relative", paddingTop: "14px", paddingLeft: "5px", paddingRight: "5px", overflyY: "scroll", paddingBottom: "5px", boxSizing: "border-box", zIndex:100, marginTop: "0px", width: "300px", height: "280px", fontSize: ".8em", color: "#FFFFFF", bottom: "0", left: "2%", backgroundColor: "transparent"}}>
							<div style={{pointerEvents: "auto", position: "relative", paddingTop: "14px", paddingLeft: "5px", paddingRight: "5px", overflyY: "scroll", paddingBottom: "5px", boxSizing: "border-box", zIndex:100, width: "275px", maxHeight: "250px", height: "250px", fontSize: "0.8em", color: "#FFFFFF", backgroundColor: "#"}}>
								<ScrollableFeed>
									<ul style={{paddingLeft: "0px", marginLeft: "5px", listStyle: "none"}}>
										{ props.showUI && messages && messages.length > 0 && messages.map((message, index) => (
											<li style={{background: "#000000db", borderRadius: "30px", padding: "10px 20px"}} key={index}>{message}</li>
										))}
									</ul>
								</ScrollableFeed>
							</div>
								<div style={{ width: "100%", height: "5%", position: "relative", bottom: "0px", boxSizing: "border-box", padding: "15px", paddingLeft: "7px" }}>
								{/* {messages.map((message, index) => (
								<p key={index}>{message}</p>
								))} */}
								<form style={{display: "flex"}} onSubmit={handleSubmit}>
									<input style={{height: "30px", pointerEvents: "auto", borderTopLeftRadius: "15px", borderBottomLeftRadius: "15px", borderTopRightRadius: "0px", borderBottomRightRadius: "0px"} } type="text" name="message" onInput={handleChange} onChange={handleChange} />
									<button className="magick-chat-button-send" style={{ height: "30px", background: "#9100ff", color: "white", fontSize: ".9em", lineHeight: ".3em", borderTopRightRadius: "15px", borderBottomRightRadius: "15px", borderTopLeftRadius: "0px", borderBottomLeftRadius: "0px"} } type="submit">Send</button>
								</form>
							</div>
						</div>
				</ClickStop>
			</>
		);
	}	
} 

const magickApp = document.querySelectorAll(
	".wp-block-magick-widget-magick-chat-widget"
);
magickApp.forEach((magickApp) => {
	if (magickApp) {
		const name = magickApp.querySelector("p.magick-chat-widget-name")
			? magickApp.querySelector("p.magick-chat-widget-name").innerText
			: "";

		const agentRoute = magickApp.querySelector("p.magick-chat-widget-agent-route")
		? magickApp.querySelector("p.magick-chat-widget-agent-route").innerText
		: "";

		const agentId = magickApp.querySelector("p.magick-chat-widget-agent-id")
		? magickApp.querySelector("p.magick-chat-widget-agent-id").innerText
		: "";

		const personality = magickApp.querySelector("p.magick-chat-widget-personality")
			? magickApp.querySelector("p.magick-chat-widget-personality").innerText
			: "";

		const defaultMessage = magickApp.querySelector("p.magick-chat-widget-default-message")
		? magickApp.querySelector("p.magick-chat-widget-default-message").innerText
		: "";

		render(
			<>
				<ChatBox 
				personality = {personality}
				objectAwareness = {false}
				name = {name}
				agentRoute = {agentRoute}
				agentId = {agentId}
				userId = { magickUserData.userId }
				defaultMessage = {defaultMessage}
				showUI = {true}
				style = {{zIndex: 100}}
				nonce={magickUserData.nonce}
				key="chatbox"/>
			</>,
			magickApp
		);
	}
});
