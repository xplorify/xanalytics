# Deployment keys
1. Generate ssh keys with `ssh-keygen -q -t rsa -N '' -f repo-key` which will give you repo-key and repo-key.pub files.
2. Add repo-key.pub to your repository deployment keys.
3. On GitHub, go to [your repository] -> Settings -> Deploy keys

Add something like this to your Dockerfile:
ADD repo-key /
RUN \
  chmod 600 /repo-key && \  
  echo "IdentityFile /repo-key" >> /etc/ssh/ssh_config && \  
  echo -e "StrictHostKeyChecking no" >> /etc/ssh/ssh_config && \  
  // your git clone commands here...


# Docker build
`docker build -t xplorify/analytics .`

# Docker run
`docker run -d \
                --name="analytics" \
                --restart="on-failure:10" \
		-p 444:444 \
                -v /xplorify/cert:/cert \
                -e NODE_ENV="tst" \
		xplorify/analytics`

