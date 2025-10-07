import {__} from '@wordpress/i18n';
import {useBlockProps} from '@wordpress/block-editor';
import {useState, useEffect} from '@wordpress/element';
import {CheckboxControl, Button, Spinner, Notice} from '@wordpress/components';
import apiFetch from '@wordpress/api-fetch';
import './editor.scss';

const generateId = () => Math.random().toString(36).substr(2, 9);

export default function Edit({attributes, setAttributes}) {
	const [postTypes, setPostTypes] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [selected, setSelected] = useState(attributes.postTypes);
	const [dirty, setDirty] = useState(false);

	// Generate uniqueId once, when block is first added
	useEffect(() => {
		if (!attributes.uniqueId) {
			setAttributes({uniqueId: generateId()});
		}
	}, []);

	useEffect(() => {
		async function fetchPostTypes() {
			try {
				setLoading(true);

				const types = await apiFetch({path: '/wp/v2/types'});

				let filtered = Object.values(types)
					.filter(
						(type) =>
							!type.slug.startsWith('wp_') &&
							type.slug !== 'attachment' &&
							type.slug !== 'nav_menu_item',
					)
					.map((type) => ({
						name: type.name,
						rest_base: type.rest_base || type.slug,
					}));

				setPostTypes(filtered);
			} catch (err) {
				console.error('Error fetching types:', err);
				setError(__('Failed to load post types', 'wp-rest-api-search'));
			} finally {
				setLoading(false);
			}
		}

		fetchPostTypes();
	}, []);

	const toggleType = (rest_base) => {
		let newSelection;

		if (selected.includes(rest_base)) {
			newSelection = selected.filter((item) => item !== rest_base);
		} else {
			newSelection = [...selected, rest_base];
		}

		setSelected(newSelection);
		setDirty(true);
	};

	const handleSave = () => {
		setAttributes({postTypes: selected});
		setDirty(false);
	};

	return (
		<div {...useBlockProps()}>
			<h3>{__('Select post types to search:', 'wp-rest-api-search')}</h3>

			{loading && <Spinner/>}

			{error && <Notice status="error">{error}</Notice>}

			{!loading && !error && (
				<div className="post-type-checkboxes">
					{postTypes.map(({rest_base, name}) => (
						<CheckboxControl
							key={rest_base}
							label={name}
							checked={selected.includes(rest_base)}
							onChange={() => toggleType(rest_base)}
						/>
					))}
				</div>
			)}

			<Button
				variant="primary"
				onClick={handleSave}
				disabled={selected.length === 0 || !dirty}
				style={{marginTop: '1rem'}}
			>
				{__('Save selection', 'wp-rest-api-search')}
			</Button>

			{selected.length > 0 && (
				<p style={{marginTop: '1rem', fontStyle: 'italic'}}>
					{__('Currently selected: ', 'wp-rest-api-search')}
					{selected.join(', ')}
				</p>
			)}
		</div>
	);
}
