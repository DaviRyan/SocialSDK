<!-- /*
 * � Copyright IBM Corp. 2013
 * 
 * Licensed under the Apache License, Version 2.0 (the "License"); 
 * you may not use this file except in compliance with the License. 
 * You may obtain a copy of the License at:
 * 
 * http://www.apache.org/licenses/LICENSE-2.0 
 * 
 * Unless required by applicable law or agreed to in writing, software 
 * distributed under the License is distributed on an "AS IS" BASIS, 
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or 
 * implied. See the License for the specific language governing 
 * permissions and limitations under the License.
 */-->
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<%@page import="com.ibm.sbt.services.client.connections.activity.ActivityNode"%>
<%@page import="com.ibm.sbt.services.client.connections.activity.ActivityNodeList"%>
<%@page import="com.ibm.sbt.services.client.connections.activity.Activity"%>
<%@page import="com.ibm.sbt.services.client.connections.activity.ActivityList"%>
<%@page import="com.ibm.sbt.services.client.connections.activity.ActivityService"%>
<%@page import="java.io.PrintWriter"%>
<%@page import="java.util.Iterator"%>
<%@page import="com.ibm.commons.runtime.Application"%>
<%@page import="com.ibm.commons.runtime.Context"%>  
 
<%@page 
	language="java" contentType="text/html; charset=ISO-8859-1"
	pageEncoding="ISO-8859-1"%>
<html>
<head>
	<title>Get Activity Nodes of an Activity</title>
	<meta http-equiv="Content-Type" content="text/html; charset=ISO-8859-1">
</head>

<body>
	<h4>Get Activity Nodes of an Activity</h4>
	<div id="content">
	<%
	try {		
		ActivityService activityService = new ActivityService();
		ActivityList activities = activityService.getMyActivities();
		if(activities != null && !activities.isEmpty()) {
			ActivityNodeList listNodes = activityService.getActivityNodes(activities.get(0).getActivityId()); 
			if(listNodes != null && !listNodes.isEmpty()) {
				for (ActivityNode activityNode : listNodes) {
					out.println(activityNode.getTitle());
				}
			} else {
				out.println("No Activity Nodes");
			}
		} else {
			out.println("No Activities Found");
		}
	} catch (Throwable e) {
		out.println("<pre>");
		out.println(e.getMessage());
		out.println("</pre>");	
	}					
	%>
	</div>
</body>
</html>