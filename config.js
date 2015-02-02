/* Configuration for server under test */

exports.authorization = {
  uri: "https://identity.oada-dev.com",
  login_fields_values: {
  	username: "andy",
  	password: "pass"
  },
  gold_client : {
  	client_id: "389kxhcnjmashlsxd8@identity.oada-dev.com",
  	key_id: "xkja3u7ndod83jxnzhs6",
  	redirect_uri: "https://example.org/redirect"
  }
};

exports.options = {
	user_agent : "OADA-TEST/1.0 (mocha; node-js)"
}