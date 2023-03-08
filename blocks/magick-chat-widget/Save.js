import { __ } from '@wordpress/i18n';
import { useBlockProps } from '@wordpress/block-editor';

export default function save({ attributes }) {

	return (
		<div {...useBlockProps.save()}>
			<p className="magick-chat-widget-name">
						{attributes.name}
			</p>
			<p className="magick-chat-widget-agent-route">
						{attributes.agentRoute}
			</p>
			<p className="magick-chat-widget-agent-id">
						{attributes.agentId}
			</p>
			<p className="magick-chat-widget-personality">
						{attributes.personality}
			</p>
			<p className="magick-chat-widget-default-message">
						{attributes.defaultMessage}
			</p>
		</div>
	)
}