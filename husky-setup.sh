# This tells your local github repo to run husky without the need to
# install husky directly. I have created a docker image that will
# run a containerized version of husky.
# TODO: RUN THIS SCRIPT IN EACH SERVICE. I HAVE PROVIDED THIS SCRIPT IN EACH

# To run this script, run this command on all OS'
# (requires Git to be installed):
# - sh husky-setup.sh
#
git config core.hooksPath .husky

# To verify this worked:
git config --get core.hooksPath

# Output should be ".husky"
