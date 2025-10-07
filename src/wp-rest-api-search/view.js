import DOMPurify from 'dompurify';

document.addEventListener('DOMContentLoaded', () => {
	const allSearchbars = document.querySelectorAll('.wp-rest-api-search');
	allSearchbars.forEach((element) => {
		const postTypes = JSON.parse(element.dataset.postTypes || '["post"]');
		initializeSearch(element, postTypes);
	});
});

function initializeSearch(element, postTypes) {
	const input = element.querySelector('input');
	const clearBtn = element.querySelector('.search-clear');
	const resultsContainer = element.querySelector('.search-results');

	let debounceTimeout;
	let abortController;

	input.addEventListener('input', handleChange);
	clearBtn.addEventListener('click', handleClear);
	document.addEventListener('click', handleClickOutside);

	function handleClear() {
		input.value = '';
		resultsContainer.textContent = '';
		clearBtn.classList.remove('visible');
	}

	function handleClickOutside(e) {
		if (!element.contains(e.target)) {
			resultsContainer.textContent = '';
		}
	}

	function handleChange(event) {
		clearTimeout(debounceTimeout);

		const query = event.target.value.trim();

		// Show/hide clear button
		clearBtn.classList.toggle('visible', query.length > 0);

		// Only search if at least 3 characters
		if (query.length < 3) {
			resultsContainer.textContent = '';
			return;
		}

		debounceTimeout = setTimeout(async () => {
			try {
				if (abortController) abortController.abort();
				abortController = new AbortController();

				resultsContainer.innerHTML = getSpinner();

				const results = await fetchPosts(query, postTypes, abortController.signal);

				if (results.length) {
					resultsContainer.innerHTML = generateHTML(results);
				} else {
					resultsContainer.innerHTML = '<div class="search-no-results">Nothing found</div>';
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

	const requests = postTypes.map((type) =>
		fetch(`/wp-json/wp/v2/${type}?search=${cleanValue}&_embed`, {signal}),
	);

	const responses = await Promise.all(requests);

	const jsonData = await Promise.all(
		responses.map((res) => {
			if (!res.ok) {
				throw new Error(`HTTP error. Status: ${res.status}`);
			}
			return res.json();
		}),
	);

	return jsonData.flat();
}

function generateHTML(data) {
	let output = '';

	data.forEach((item) => {
		let imageHtml = '';

		if (item._embedded && item._embedded['wp:featuredmedia'] && item._embedded['wp:featuredmedia'][0]) {
			const img = item._embedded['wp:featuredmedia'][0];
			const imgUrl =
				img.media_details?.sizes?.thumbnail?.source_url || img.source_url;

			if (imgUrl) {
				imageHtml = `<img alt src="${imgUrl}" loading="lazy" />`;
			}
		}

		output += `
			<div class="search-result-item">
				${imageHtml}
				<h3><a href="${item.link}">${item.title.rendered}</a></h3>
			</div>
		`;
	});

	return DOMPurify.sanitize(output);
}

function getSpinner() {
	return `
		<div class="spinner" aria-hidden="true">
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
