import DOMPurify from 'dompurify';

document.addEventListener('DOMContentLoaded', () => {
	const allSearchbars = document.querySelectorAll('.rest-api-searchbar');
	allSearchbars.forEach((element) => {
		const postTypes = JSON.parse(element.dataset.postTypes || '["post"]');
		initializeSearch(element, postTypes);
	});
});

function initializeSearch(element, postTypes) {
	const input = element.querySelector('input');
	const resultsContainer = element.querySelector('.search-results');

	let debounceTimeout;
	let abortController;

	input.addEventListener('input', handleChange);

	function handleChange(event) {
		clearTimeout(debounceTimeout);

		const rawValue = event.target.value.trim();

		// Only search if input has at least 3 characters
		if (rawValue.length < 3) {
			resultsContainer.textContent = '';
			return;
		}

		// debounce: wait 600ms after user stops typing
		debounceTimeout = setTimeout(async () => {
			try {
				// cancel previous request if still pending
				if (abortController) {
					abortController.abort();
				}
				abortController = new AbortController();

				// render spinner
				resultsContainer.innerHTML = getSpinner();

				const results = await fetchPosts(rawValue, postTypes, abortController.signal);

				if (results.length) {
					resultsContainer.innerHTML = generateHTML(results);
				} else {
					resultsContainer.textContent = 'Nothing found';
				}
			} catch (error) {
				if (error.name !== 'AbortError') {
					resultsContainer.textContent = 'Something went wrong. Please try again.';
					console.error(error);
				}
			}
		}, 600);
	}
}

async function fetchPosts(query, postTypes, signal) {
	const cleanValue = encodeURIComponent(query);

	// Build queries for each post type and run in parallel
	const requests = postTypes.map((type) =>
		fetch(`/wp-json/wp/v2/${type}?search=${cleanValue}&_embed`, { signal })
	);

	const responses = await Promise.all(requests);

	const jsonData = await Promise.all(responses.map((res) => {
		if (!res.ok) {
			throw new Error(`HTTP error. Status: ${res.status}`);
		}
		return res.json();
	}));

	// Flatten results into one array
	return jsonData.flat();
}

function generateHTML(data) {
	let output = '';

	data.forEach((item) => {
		let imageHtml = '';

		if (item._embedded && item._embedded['wp:featuredmedia'] && item._embedded['wp:featuredmedia'][0]) {
			const img = item._embedded['wp:featuredmedia'][0];
			const imgUrl =
				img.media_details?.sizes?.thumbnail?.source_url ||
				img.source_url;

			if (imgUrl) {
				imageHtml = `<img alt src="${imgUrl}" loading="lazy" />`;
			}
		}

		output += `
			<div class="search-result-item">
				${imageHtml}
				<h3>
					<a href="${item.link}">${item.title.rendered}</a>
				</h3>
			</div>
		`;
	});

	return DOMPurify.sanitize(output);
}

function getSpinner() {
	return `
		<div class="spinner" aria-hidden="true" style="display:flex;justify-content:center;padding:1rem;">
			<svg width="32" height="32" viewBox="0 0 38 38" xmlns="http://www.w3.org/2000/svg" stroke="#333">
				<g fill="none" fill-rule="evenodd">
					<g transform="translate(1 1)" stroke-width="2">
						<circle stroke-opacity=".3" cx="18" cy="18" r="18"/>
						<path d="M36 18c0-9.94-8.06-18-18-18">
							<animateTransform
								attributeName="transform"
								type="rotate"
								from="0 18 18"
								to="360 18 18"
								dur="1s"
								repeatCount="indefinite"/>
						</path>
					</g>
				</g>
			</svg>
		</div>
	`;
}
