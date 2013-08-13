require(["sbt/dom", "sbt/connections/controls/profiles/ProfilePanel"],
function(dom, ProfilePanel) {
	var profilePanel = new ProfilePanel({
        email : '%{sample.email1}'
    }, document.createElement('div'));

    dom.byId("profilePanelDiv").appendChild(profilePanel.domNode);

});
