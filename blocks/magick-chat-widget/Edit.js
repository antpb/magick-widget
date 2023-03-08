import { __ } from "@wordpress/i18n";
import './editor.scss';
import ScrollableFeed from 'react-scrollable-feed'
import React, { Suspense, useRef, useState, useEffect, useMemo } from "react";
import {
	useBlockProps,
	ColorPalette,
	InspectorControls,
	MediaUpload
} from "@wordpress/block-editor";
import {
	Panel,
	PanelBody,
	PanelRow,
	RangeControl,
	ToggleControl,
	SelectControl,
	TextControl,
	TextareaControl
} from "@wordpress/components";
import { more } from "@wordpress/icons";

export const Editor = ({ value, onChange, isSelected }) => (
	<>
		<p>{value}</p>
	</>
);

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
	const inputMessageLog = 'Guest: ' + String(input.value);
	input.value = '';


		const speaker = "guest";
		const agent = props.name;

	try {
		let finalPersonality = props.personality;
			const someData = {
			speaker: value,
			agentRoute: props.agentRoute,
			speakerName: speaker,
			agentName: agent,
			personality: finalPersonality
		};
		const postData = {
			content: JSON.stringify(someData),
			id: props.agentId,
		};

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

		return (
			<>
				<ClickStop>
						<div style={{pointerEvents: "auto", position: "relative", paddingTop: "14px", paddingLeft: "5px", paddingRight: "5px", overflyY: "scroll", paddingBottom: "5px", boxSizing: "border-box", zIndex:100, marginTop: "0px", width: "300px", height: "330px", fontSize: ".8em", color: "#FFFFFF", bottom: "0", left: "2%", backgroundColor: "transparent"}}>
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

const ClickStop = ({ children }) => {
	return <div onClick={e => {
		e.stopPropagation()
	}}>
		{children}
	</div>;
};

export default function Edit({ attributes, setAttributes, isSelected }) {
	const onChangeName = (name) => {
		setAttributes({ name });
	};
	const onChangePersonality = (personality) => {
		setAttributes({ personality });
	};
	
	const onChangeDefaultMessage = (defaultMessage) => {
		setAttributes({ defaultMessage });
	};
		
	const onChangeAgentRoute = (agentRoute) => {
		setAttributes({ agentRoute });
	};
	const onChangeAgentId = (agentId) => {
		setAttributes({ agentId });
	};

	return (
		<div {...useBlockProps()}>
			<InspectorControls key="setting">
				<Panel header="Settings">
					<PanelBody
						title="Chat Widget Options"
						icon={more}
						initialOpen={true}
					>
						<PanelRow>
							<TextControl
								label="Agent Route"
								help="Define the route of the agent to be used for this widget."
								value={attributes.agentRoute}
								onChange={(value) => onChangeAgentRoute(value)}
							/>
						</PanelRow>
						<PanelRow>
							<TextControl
								label="Agent ID"
								help="Define the id of the agent to be used for this widget."
								value={attributes.agentId}
								onChange={(value) => onChangeAgentId(value)}
							/>
						</PanelRow>
						<PanelRow>
							<TextControl
								label="Name"
								help="Give your agent a name."
								value={attributes.name}
								onChange={(value) => onChangeName(value)}
							/>
						</PanelRow>
						<PanelRow>
							<TextareaControl
								label="Personality"
								help="Give your agent a personality in XXX characters or less."
								value={attributes.personality}
								onChange={(value) => onChangePersonality(value)}
								maxLength={600}
							/>
						</PanelRow>
						<PanelRow>
							<TextareaControl
								label="Default Message"
								help="Give your agent a default message to initialize with."
								value={attributes.defaultMessage}
								onChange={(value) => onChangeDefaultMessage(value)}
								maxLength={600}
							/>
						</PanelRow>
					</PanelBody>
				</Panel>
			</InspectorControls>			
			<ChatBox 
			personality = {attributes.personality}
			agentId = {attributes.agentId}
			agentRoute = {attributes.agentRoute}
			name = {attributes.name}
			defaultMessage = {attributes.defaultMessage}
			showUI = {true}
			style = {{zIndex: 100}}
			nonce={magickUserData.nonce}
			key="something"/>
		</div>
	);
}
