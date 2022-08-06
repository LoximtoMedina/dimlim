import React from 'react';
import axios from 'axios';

import { GetServerSideProps, NextPage } from 'next';

export const getServerSideProps: GetServerSideProps = async (context: any) => {
	if (context.req.user !== undefined)
		return {
			redirect: {
				destination: '/home',
				permanent: false,
			},
		};

	try {
		let languageResponse: any = await axios({
			method: 'get',
			url: `${process.env.HOST}/api/content/language/`,
			params: {
				lang: context.req.headers['accept-language'].split(',')[0],
				category: 'main',
				page: 'home',
			},
		});

		return {
			props: {
				lang: languageResponse.data,
			},
		};
	} catch (err: any) {
		return {
			redirect: {
				destination: `/error?code=${err.response.status}`,
				permanent: false,
			},
		};
	}
};

const Home: NextPage = (props: any) => {
	return (
		<div>
			<h1>{props.lang.title}</h1>
		</div>
	);
};

export default Home;
