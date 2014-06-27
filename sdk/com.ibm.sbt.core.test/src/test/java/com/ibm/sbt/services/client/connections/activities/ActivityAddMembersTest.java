/*
 * � Copyright IBM Corp. 2014
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
 */
package com.ibm.sbt.services.client.connections.activities;

import org.junit.Assert;
import org.junit.Test;

import com.ibm.commons.xml.XMLException;
import com.ibm.sbt.services.client.ClientServicesException;
import com.ibm.sbt.services.client.connections.common.Member;

/**
 * @author David Ryan
 *
 */
public class ActivityAddMembersTest extends BaseActivityServiceTest {

	@Test
	public void testAddMembers() throws ClientServicesException, XMLException {
		//
		String memberId = this.properties.getProperty("userId2");
		String memberId2 = this.properties.getProperty("userId3");
		
		Member member = new Member();
		Member member2 = new Member();
		member.setId(memberId);
		member2.setId(memberId2);
		
		Member[] members = {member,member2};
		
		
		Activity activity = createActivity();
		activity.addMembers(activity,members);
		//Assert.assertNotNull(member);
		
		this.activity = null;
	}

}
