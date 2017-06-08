Build:
`docker build -t xplorify/analytics .`

Run:
`docker run -d \
                --name="analytics" \
		-p 444:444 \
                -v /xplorify/cert:/cert \
                -e NODE_ENV="tst" \
		xplorify/analytics`

