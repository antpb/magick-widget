import { Suspense, useState, useEffect } from "@wordpress/element";
  
//Main component for admin page app
export default function App({ getSettings, updateSettings }) {

	//Track settings state
	const [settings, setSettings] = useState({});
	//Use to show loading spinner
	const [isLoading, setIsLoading] = useState(true);
	const [ismagickApiKeyVisible, setIsmagickApiKeyVisible] = useState(false);

	//When app loads, get settings
	useEffect(() => {
		getSettings().then((r) => {
			setSettings(r);
			setIsLoading(false);
		});
	}, [getSettings, setSettings]);

    //Function to update settings via API
	const onSave = async (event) => {
		event.preventDefault();
		let response = await updateSettings(settings)
		setSettings(response);
	};

	//Show a spinner if loading
	if (isLoading) {
		return <div className="spinner" style={{ visibility: "visible" }} />;
	}
	//Show settings if not loading
	return (
		<>
		<form autocomplete="off">
		<table class="form-table">
			<tbody>
				<tr>
					<td>
						<div><h2>Magick Settings</h2></div>
						<div><p>Here you can manage the settings for Magick to tweak global configuration options and save your API keys for connected serivces.</p></div>
					</td>
				</tr>
				<tr>
					<td><h3>AI Settings</h3></td>
				</tr>
				<tr>
					<td>Widget Settings</td>
				</tr>
				<tr>
					<td>
						<label htmlFor="enabled">Enable</label>
						<input
							id="enabled"
							type="checkbox"
							name="enabled"
							value={settings.enabled}
							checked={settings.enabled}
							onChange={(event) => {
								setSettings({ ...settings, enabled: event.target.checked });
							}}
						/>
					</td>
				</tr>
				<tr>
					<td>
						<label htmlFor="networkWorker">AI Endpoint URL</label>
						<input
							id="networkWorker"
							type="input"
							className="regular-text"
							name="networkWorker"
							autoComplete="off"
							value={settings.networkWorker}
							onChange={(event) => {
								setSettings({ ...settings, networkWorker: event.target.value });
							}}
						/>
					</td>
				</tr>
				<tr>
					<td>
						<label htmlFor="magickApiKey">API Key</label>
						{ismagickApiKeyVisible ? (
							<input
							id="magickApiKey"
							type="text"
							name="magickApiKey"
							autoComplete="off"
							value={settings.magickApiKey}
							onChange={(event) => {
								setSettings({ ...settings, magickApiKey: event.target.value });
							}}
							/>
						) : (
							<input
							id="magickApiKey"
							type="password"
							name="magickApiKey"
							autoComplete="off"
							value={settings.magickApiKey}
							onChange={(event) => {
								setSettings({ ...settings, magickApiKey: event.target.value });
							}}
							/>
						)}
						<button type="button" onClick={() => setIsmagickApiKeyVisible(!ismagickApiKeyVisible)}>
						{ismagickApiKeyVisible ? 'Hide' : 'Show'} Key
						</button>
					</td>
				</tr>
				{/* Select element with three options for AI type public, or logged in */}
				<tr>
					<td>
						<label htmlFor="aiType">AI Access Level</label>
						<select
							id="aiType"
							name="aiType"
							value={settings.allowPublicAI}
							onChange={(event) => {
								setSettings({ ...settings, allowPublicAI: event.target.value });
							}}
						>
							<option value="public">Public</option>
							<option value="loggedIn">Logged In</option>
						</select>
					</td>
				</tr>
				<tr>
					<td><input id="save" className="button button-small button-primary" type="submit" name="enabled" onClick={onSave} /></td>
				</tr>
			</tbody>
		</table>
		</form>
		</>	
	);
}
