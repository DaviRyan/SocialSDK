/*
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
 */

/**
 * The Forums application of IBM� Connections enables a team to discuss issues that are pertinent to their work. 
 * The Forums API allows application programs to create new forums, and to read and modify existing forums.
 * 
 * @module sbt.connections.ForumsService
 */
define([ "../declare", "../config", "../lang", "../stringUtil", "../Promise", "./ForumConstants", "../base/BaseService",
         "../base/AtomEntity", "../base/XmlDataHandler" ], 
    function(declare,config,lang,stringUtil,Promise,consts,BaseService,AtomEntity,XmlDataHandler) {
	
	var CategoryForum = "<category scheme=\"http://www.ibm.com/xmlns/prod/sn/type\" term=\"forum-forum\"></category>";
	var CategoryTopic = "<category scheme=\"http://www.ibm.com/xmlns/prod/sn/type\" term=\"forum-topic\"></category>";
	var CategoryReply = "<category scheme=\"http://www.ibm.com/xmlns/prod/sn/type\" term=\"forum-reply\"></category>";
    
	var TopicTmpl = "<thr:in-reply-to xmlns:thr=\"http://purl.org/syndication/thread/1.0\" ref=\"urn:lsid:ibm.com:forum:${getForumUuid}\" type=\"application/atom+xml\" href=\"\"></thr:in-reply-to>";
	var ReplyTmpl = "<thr:in-reply-to xmlns:thr=\"http://purl.org/syndication/thread/1.0\" ref=\"urn:lsid:ibm.com:forum:${getTopicUuid}\" type=\"application/atom+xml\" href=\"\"></thr:in-reply-to>";
	
    /**
     * Forum class represents an entry for a forums feed returned by the
     * Connections REST API.
     * 
     * @class Forum
     * @namespace sbt.connections
     */
    var Forum = declare(AtomEntity, {
    	
    	xpath : consts.ForumXPath,
    	contentType : "html",
    	categoryScheme : CategoryForum,
    	
        /**
         * Construct a Forum entity.
         * 
         * @constructor
         * @param args
         */
        constructor : function(args) {
        },

        /**
         * Return the value of id from Forum ATOM
         * entry document.
         * 
         * @method getForumUuid
         * @return {String} ID of the Forum
         */
        getForumUuid : function() {
            var uid = this.getAsString("forumUuid");
            return extractForumUuid(uid);
        },

        /**
         * Sets id of IBM Connections forum.
         * 
         * @method setForumUuid
         * @param {String} forumUuid Id of the forum
         */
        setForumUuid : function(forumUuid) {
            return this.setAsString("forumUuid", forumUuid);
        },

        /**
         * Return the moderation of the IBM Connections forum from
         * forum ATOM entry document.
         * 
         * @method getModeration
         * @return {String} Moderation of the forum
         */
        getModeration : function() {
            return this.getAsDate("moderation");
        },
        
        /**
         * Return the thread count of the IBM Connections forum from
         * forum ATOM entry document.
         * 
         * @method getThreadCount
         * @return {Number} Thread count of the forum
         */
        getThreadCount : function() {
            return this.getAsNumber("threadCount");
        },
        
        /**
         * Return the url of the IBM Connections forum from
         * forum ATOM entry document.
         * 
         * @method getForumUrl
         * @return {String} Url of the forum
         */
        getForumUrl : function() {
            return this.getAlternateUrl();
        },
                
        /**
         * Get a list for forum topics that includes the topics in the specified forum.
         * 
         * @method getTopics
         * @param {Object} args
         */
        getTopics : function(args) {
        	return this.service.getForumTopics(this.getForumUuid(), args);
        },
        
        /**
         * Loads the forum object with the atom entry associated with the
         * forum. By default, a network call is made to load the atom entry
         * document in the forum object.
         * 
         * @method load
         * @param {Object} [args] Argument object
         */
        load : function(args) {
            // detect a bad request by validating required arguments
            var forumUuid = this.getForumUuid();
            var promise = this.service._validateForumUuid(forumUuid);
            if (promise) {
                return promise;
            }

            var self = this;
            var callbacks = {
                createEntity : function(service,data,response) {
                    self.setData(data);
                    return self;
                }
            };

            var requestArgs = lang.mixin({
                forumUuid : forumUuid
            }, args || {});
            var options = {
                handleAs : "text",
                query : requestArgs
            };
            
            return this.service.getEntity(consts.AtomForum, options, forumUuid, callbacks);
        },

        /**
         * Remove this forum
         * 
         * @method remove
         * @param {Object} [args] Argument object
         */
        remove : function(args) {
            return this.service.deleteForum(this.getForumUuid(), args);
        },

        /**
         * Update this forum
         * 
         * @method remove
         * @param {Object} [args] Argument object
         */
        update : function(args) {
            return this.service.updateForum(this, args);
        },
        
        /**
         * Save this forum
         * 
         * @method remove
         * @param {Object} [args] Argument object
         */
        save : function(args) {
            if (this.getForumUuid()) {
                return this.service.updateForum(this, args);
            } else {
                return this.service.createForum(this, args);
            }
        }        
       
    });
    
    /**
     * ForumTopic class represents an entry for a forums topic feed returned by the
     * Connections REST API.
     * 
     * @class ForumTopic
     * @namespace sbt.connections
     */
    var ForumTopic = declare(AtomEntity, {

    	xpath : consts.ForumTopicXPath,
    	contentType : "html",
    	categoryScheme : CategoryTopic,
    	
        /**
         * Construct a ForumTopic entity.
         * 
         * @constructor
         * @param args
         */
        constructor : function(args) {
        },

        /**
         * Return the value of id from Forum Topic ATOM
         * entry document.
         * 
         * @method getTopicUuid
         * @return {String} ID of the Forum Topic
         */
        getTopicUuid : function() {
            var uid = this.getAsString("topicUuid");
            return extractForumUuid(uid);
        },

        /**
         * Sets id of IBM Connections Forum Topic.
         * 
         * @method setTopicUuid
         * @param {String} topicUuid Id of the forum topic
         */
        setTopicUuid : function(topicUuid) {
            return this.setAsString("topicUuid", topicUuid);
        },

        /**
         * Return the value of IBM Connections forum ID from forum ATOM
         * entry document.
         * 
         * @method getForumUuid
         * @return {String} Forum ID of the forum
         */
        getForumUuid : function() {
            var uid = this.getAsString("forumUuid");
            return extractForumUuid(uid);
        },

        /**
         * Sets id of IBM Connections forum.
         * 
         * @method setForumUuid
         * @param {String} forumUuid Id of the forum
         */
        setForumUuid : function(forumUuid) {
            return this.setAsString("forumUuid", forumUuid);
        },

        /**
         * Return the url of the IBM Connections forum from
         * forum ATOM entry document.
         * 
         * @method getTopicUrl
         * @return {String} Url of the forum
         */
        getTopicUrl : function() {
            return this.getAsString("alternateUrl");
        },
                
        /**
         * Return the permissions of the IBM Connections forum topic from
         * forum ATOM entry document.
         * 
         * @method getPermisisons
         * @return {String} Permissions of the forum topic
         */
        getPermisisons : function() {
            return this.getAsString("permissions");
        },
                
        /**
         * Get a list for forum replies that includes the replies in this topic.
         * 
         * @method getReplies
         */
        getReplies : function(args) {
        	return this.service.getForumReplies(this.getTopicUuid(), args);
        },
        
        /**
         * Loads the forum topic object with the atom entry associated with the
         * forum topic. By default, a network call is made to load the atom entry
         * document in the forum topic object.
         * 
         * @method load
         * @param {Object} [args] Argument object
         */
        load : function(args) {
            // detect a bad request by validating required arguments
            var topicUuid = this.getTopicUuid();
            var promise = this.service._validateTopicUuid(topicUuid);
            if (promise) {
                return promise;
            }

            var self = this;
            var callbacks = {
                createEntity : function(service,data,response) {
                    self.setData(data);
                    return self;
                }
            };

            var requestArgs = lang.mixin({
                topicUuid : topicUuid
            }, args || {});
            var options = {
                handleAs : "text",
                query : requestArgs
            };
            
            return this.service.getEntity(consts.AtomTopic, options, topicUuid, callbacks);
        },

        /**
         * Remove this forum topic
         * 
         * @method remove
         * @param {Object} [args] Argument object
         */
        remove : function(args) {
            return this.service.deleteForumTopic(this.getTopicUuid(), args);
        },

        /**
         * Update this forum topic
         * 
         * @method remove
         * @param {Object} [args] Argument object
         */
        update : function(args) {
            return this.service.updateForumTopic(this, args);
        },
        
        /**
         * Save this forum topic
         * 
         * @method remove
         * @param {Object} [args] Argument object
         */
        save : function(args) {
            if (this.getTopicUuid()) {
                return this.service.updateForumTopic(this, args);
            } else {
                return this.service.createForumTopic(this, args);
            }
        }        
               
    });
    
    /**
     * ForumReply class represents an entry for a forums reply feed returned by the
     * Connections REST API.
     * 
     * @class ForumReply
     * @namespace sbt.connections
     */
    var ForumReply = declare(AtomEntity, {

    	xpath : consts.ForumReplyXPath,
    	contentType : "html",
    	categoryScheme : CategoryReply,
    	
        /**
         * Construct a ForumReply entity.
         * 
         * @constructor
         * @param args
         */
        constructor : function(args) {
        },
        
        /**
         * Return extra entry data to be included in post data for this entity.
         * 
         * @returns {String}
         */
        createEntryData : function() {
        	if (!this.getTopicUuid()) {
        		return "";
        	}
            var transformer = function(value,key) {
                return value;
            };
            var postData = stringUtil.transform(ReplyTmpl, this, transformer, this);
            return stringUtil.trim(postData);
        },

        /**
         * Return the value of id from Forum Reply ATOM
         * entry document.
         * 
         * @method getReplyUuid
         * @return {String} ID of the Forum Reply
         */
        getReplyUuid : function() {
            var uid = this.getAsString("replyUuid");
            return extractForumUuid(uid);
        },

        /**
         * Sets id of IBM Connections Forum Reply.
         * 
         * @method setReplyUuid
         * @param {String} replyUuid Id of the forum reply
         */
        setReplyUuid : function(replyUuid) {
            return this.setAsString("replyUuid", replyUuid);
        },

        /**
         * Return the value of IBM Connections topic ID from forum ATOM
         * entry document.
         * 
         * @method getTopicUuid
         * @return {String} ID of the forum topic
         */
        getTopicUuid : function() {
            var uid = this.getAsString("topicUuid");
            return extractForumUuid(uid);
        },

        /**
         * Sets id of IBM Connections forum.
         * 
         * @method setTopicUuid
         * @param {String} topicUuid Id of the forum topic
         */
        setTopicUuid : function(topicUuid) {
            return this.setAsString("topicUuid", topicUuid);
        },

        /**
         * Return the url of the IBM Connections Forum Reply reply from
         * forum ATOM entry document.
         * 
         * @method getReplyUrl
         * @return {String} Url of the forum
         */
        getReplyUrl : function() {
            return this.getAlternateUrl();
        },
                
        /**
         * Return the permissions of the IBM Connections Forum Reply from
         * forum ATOM entry document.
         * 
         * @method getPermisisons
         * @return {String} Permissions of the Forum Reply
         */
        getPermisisons : function() {
            return this.getAsString("permissions");
        },
        
        /**
         * Loads the forum reply object with the atom entry associated with the
         * forum reply. By default, a network call is made to load the atom entry
         * document in the forum reply object.
         * 
         * @method load
         * @param {Object} [args] Argument object
         */
        load : function(args) {
            // detect a bad request by validating required arguments
            var topicUuid = this.getReplyUuid();
            var promise = this.service._validateReplyUuid(topicUuid);
            if (promise) {
                return promise;
            }

            var self = this;
            var callbacks = {
                createEntity : function(service,data,response) {
                    self.setData(data);
                    return self;
                }
            };

            var requestArgs = lang.mixin({
                replyUuid : replyUuid
            }, args || {});
            var options = {
                handleAs : "text",
                query : requestArgs
            };
            
            return this.service.getEntity(consts.AtomReply, options, replyUuid, callbacks);
        },

        /**
         * Remove this forum reply
         * 
         * @method remove
         * @param {Object} [args] Argument object
         */
        remove : function(args) {
            return this.service.deleteForumReply(this.getReplyUuid(), args);
        },

        /**
         * Update this forum reply
         * 
         * @method remove
         * @param {Object} [args] Argument object
         */
        update : function(args) {
            return this.service.updateForumReply(this, args);
        },
        
        /**
         * Save this forum reply
         * 
         * @method remove
         * @param {Object} [args] Argument object
         */
        save : function(args) {
            if (this.getReplyUuid()) {
                return this.service.updateForumReply(this, args);
            } else {
                return this.service.createForumReply(this, args);
            }
        }        
               
    });
    
    /**
     * ForumTag class represents an entry for a forums tag feed returned by the
     * Connections REST API.
     * 
     * @class ForumTag
     * @namespace sbt.connections
     */
    var ForumTag = declare(AtomEntity, {

    	categoryScheme : null,
    	
        /**
         * Construct a Forum Tag entity.
         * 
         * @constructor
         * @param args
         */
        constructor : function(args) {
        }
    
    });
    
    /*
     * Method used to extract the forum uuid for an id string.
     */
    var extractForumUuid = function(uid) {
        if (uid && uid.indexOf("urn:lsid:ibm.com:forum:") == 0) {
            return uid.substring("urn:lsid:ibm.com:forum:".length);
        } else {
            return uid;
        }
    }; 
    
    /*
     * Callbacks used when reading a feed that contains forum entries.
     */
    var ForumFeedCallbacks = {
        createEntities : function(service,data,response) {
            return new XmlDataHandler({
                service : service,
                data : data,
                namespaces : consts.Namespaces,
                xpath : consts.ForumsFeedXPath
            });
        },
        createEntity : function(service,data,response) {
            return new Forum({
                service : service,
                data : data
            });
        }
    };

    /*
     * Callbacks used when reading a feed that contains forum topic entries.
     */
    var ForumTopicFeedCallbacks = {
        createEntities : function(service,data,response) {
            return new XmlDataHandler({
                service : service,
                data : data,
                namespaces : consts.Namespaces,
                xpath : consts.ForumsFeedXPath
            });
        },
        createEntity : function(service,data,response) {
            return new ForumTopic({
                service : service,
                data : data
            });
        }
    };

    /*
     * Callbacks used when reading a feed that contains forum topic reply entries.
     */
    var ForumReplyFeedCallbacks = {
        createEntities : function(service,data,response) {
            return new XmlDataHandler({
                service : service,
                data : data,
                namespaces : consts.Namespaces,
                xpath : consts.ForumsFeedXPath
            });
        },
        createEntity : function(service,data,response) {
            return new ForumReply({
                service : service,
                data : data
            });
        }
    };

    /**
     * ForumsService class.
     * 
     * @class ForumsService
     * @namespace sbt.connections
     */
    var ForumService = declare(BaseService, {

        /**
         * Constructor for ForumsService
         * 
         * @constructor
         * @param args
         */
        constructor : function(args) {
            if (!this.endpoint) {
                this.endpoint = config.findEndpoint(this.getDefaultEndpointName());
            }
        },

        /**
         * Return the default endpoint name if client did not specify one.
         * @returns {String}
         */
        getDefaultEndpointName: function() {
            return "connections";
        },
        
        /**
         * Create a Forum object with the specified data.
         * 
         * @method newForum
         * @param {Object} args Object containing the fields for the 
         * new Forum 
         */
        newForum : function(args) {
            return this._toForum(args);
        },
        
        /**
         * Create a ForumTopic object with the specified data.
         * 
         * @method newForumTopic
         * @param {Object} args Object containing the fields for the 
         * new ForumTopic
         */
        newForumTopic : function(args) {
            return this._toForumTopic(args);
        },
        
        /**
         * Create a ForumReply object with the specified data.
         * 
         * @method newForumReply
         * @param {Object} args Object containing the fields for the 
         * new ForumReply 
         */
        newForumReply : function(args) {
            return this._toForumReply(args);
        },
        
        /**
         * Get a feed that includes forums created by the authenticated user or associated with communities to which the user belongs.
         * 
         * @method getMyForums
         * @param requestArgs
         */
        getMyForums: function(requestArgs) {
            var options = {
                method : "GET",
                handleAs : "text",
                query : requestArgs || {}
            };
            
            return this.getEntities(consts.AtomForumsMy, options, ForumFeedCallbacks);
        },      
        
        /**
         * Get a feed that includes all stand-alone and forum forums created in the enterprise.
         * 
         * @method getAllForums
         * @param requestArgs
         */
        getAllForums: function(requestArgs) {
            var options = {
                method : "GET",
                handleAs : "text",
                query : requestArgs || {}
            };
            
            return this.getEntities(consts.AtomForums, options, ForumFeedCallbacks);
        },      
        
        /**
         * Get a feed that includes all stand-alone and forum forums created in the enterprise.
         * 
         * @method getAllForums
         * @param requestArgs
         */
        getPublicForums: function(requestArgs) {
            var options = {
                method : "GET",
                handleAs : "text",
                query : requestArgs || {}
            };
            
            return this.getEntities(consts.AtomForumsPublic, options, ForumFeedCallbacks);
        },
        
        /**
         * Get a list for forum topics that includes the topics in the specified forum.
         * 
         * @method getForumTopics
         * @param forumUuid
         * @param args
         * @returns
         */
        getForumTopics: function(forumUuid, args) {
            var promise = this._validateForumUuid(forumUuid);
            if (promise) {
                return promise;
            }
            
            var requestArgs = lang.mixin(
            	{ forumUuid : forumUuid }, args || {});
            var options = {
                method : "GET",
                handleAs : "text",
                query : requestArgs
            };
            
            return this.getEntities(consts.AtomTopics, options, ForumTopicFeedCallbacks);
        },
        
        /**
         * Get a list for forum replies that includes the replies in the specified topic.
         * 
         * @method getForumReplies
         * @param topicUuid
         * @param args
         * @returns
         */
        getForumReplies: function(topicUuid, args) {
            var promise = this._validateTopicUuid(topicUuid);
            if (promise) {
                return promise;
            }
            
            var requestArgs = lang.mixin(
            	{ topicUuid : topicUuid }, args || {});
            var options = {
                method : "GET",
                handleAs : "text",
                query : requestArgs
            };
            
            return this.getEntities(consts.AtomReplies, options, ForumReplyFeedCallbacks);
        },
        
        /**
         * Retrieve a forum entry, use the edit link for the forum entry 
         * which can be found in the my communities feed.
         * 
         * @method getForum
         * @param {String } forumUuid
         * @param {Object} args Object containing the query arguments to be 
         * sent (defined in IBM Connections Communities REST API) 
         */
        getForum : function(forumUuid, args) {
            var forum = new Forum({
                service : this,
                _fields : { forumUuid : forumUuid }
            });
            return forum.load(args);
        },

        /**
         * Create a forum by sending an Atom entry document containing the 
         * new forum to the My Forums resource.
         * 
         * @method createForum
         * @param {Object} forum Forum object which denotes the forum to be created.
         * @param {Object} [args] Argument object
         */
        createForum : function(forumOrJson,args) {
            var forum = this._toForum(forumOrJson);
            var promise = this._validateForum(forum, false, args);
            if (promise) {
                return promise;
            }

            var callbacks = {};
            callbacks.createEntity = function(service,data,response) {
                forum.setData(data);
                var forumUuid = this.getLocationParameter(response, "forumUuid");
                forum.setForumUuid(forumUuid);
                return forum;
            };

            var options = {
                method : "POST",
                query : args || {},
                headers : consts.AtomXmlHeaders,
                data : forum.createPostData()
            };
            
            return this.updateEntity(consts.AtomForumsMy, options, callbacks, args);
        },

        /**
         * Update a forum by sending a replacement forum entry document in Atom format 
         * to the existing forum's edit web address.
         * All existing forum entry information will be replaced with the new data. To avoid 
         * deleting all existing data, retrieve any data you want to retain first, and send it back 
         * with this request. For example, if you want to add a new tag to a forum entry, retrieve 
         * the existing tags, and send them all back with the new tag in the update request.
         * 
         * @method updateForum
         * @param {Object} forum Forum object
         * @param {Object} [args] Argument object
         */
        updateForum : function(forumOrJson,args) {
            var forum = this._toForum(forumOrJson);
            var promise = this._validateForum(forum, true, args);
            if (promise) {
                return promise;
            }
            
            var callbacks = {};
            callbacks.createEntity = function(service,data,response) {
            	// preserve the forumUuid
            	var forumUuid = forum.getForumUuid();
                forum.setData(data);
                forum.setForumUuid(forumUuid);
                return forum;
            };

            var requestArgs = lang.mixin({
                forumUuid : forum.getForumUuid()
            }, args || {});
            
            var options = {
                method : "PUT",
                query : requestArgs,
                headers : consts.AtomXmlHeaders,
                data : forum.createPostData()
            };
            
            return this.updateEntity(consts.AtomForum, options, callbacks, args);
        },

        /**
         * Delete a forum, use the HTTP DELETE method.
         * Only the owner of a forum can delete it. Deleted communities cannot be restored
         * 
         * @method deleteForum
         * @param {String/Object} forum id of the forum or the forum object (of the forum to be deleted)
         * @param {Object} [args] Argument object
         */
        deleteForum : function(forumUuid,args) {
            var promise = this._validateForumUuid(forumUuid);
            if (promise) {
                return promise;
            }            
           
            var requestArgs = lang.mixin({
                forumUuid : forumUuid
            }, args || {});
            
            var options = {
                method : "DELETE",
                query : requestArgs,
                handleAs : "text"
            };
            
            return this.deleteEntity(consts.AtomForum, options, forumUuid);
        },
        
        /**
         * Retrieve a forum topic entry, use the edit link for the forum topic entry 
         * which can be found in the My Forums feed.
         * 
         * @method getForumTopic
         * @param {String } topicUuid
         * @param {Object} args Object containing the query arguments to be 
         * sent (defined in IBM Connections Communities REST API) 
         */
        getForumTopic : function(topicUuid, args) {
            var forumTopic = new ForumTopic({
                service : this,
                _fields : { topicUuid : topicUuid }
            });
            return forumTopic.load(args);
        },

        /**
         * Create a forum topc by sending an Atom entry document containing the 
         * new forum to the forum replies resource.
         * 
         * @method createForumTopic
         * @param {Object} forumTopic Forum topic object which denotes the forum topic to be created.
         * @param {Object} [args] Argument object
         */
        createForumTopic : function(topicOrJson,args) {
            var forumTopic = this._toForumTopic(topicOrJson);
            var promise = this._validateForumTopic(forumTopic, false, args);
            if (promise) {
                return promise;
            }

            var callbacks = {};
            callbacks.createEntity = function(service,data,response) {
                var topicUuid = this.getLocationParameter(response, "topicUuid");
                forumTopic.setTopicUuid(topicUuid);
                forumTopic.setData(data);
                return forumTopic;
            };

            var options = {
                method : "POST",
                query : args || { forumUuid : forumTopic.getForumUuid() },
                headers : consts.AtomXmlHeaders,
                data : forumTopic.createPostData()
            };
            
            return this.updateEntity(consts.AtomTopics, options, callbacks, args);
        },

        /**
         * Update a forum topic by sending a replacement forum entry document in Atom format 
         * to the existing forum topic's edit web address.
         * All existing forum entry information will be replaced with the new data. To avoid 
         * deleting all existing data, retrieve any data you want to retain first, and send it back 
         * with this request. For example, if you want to add a new tag to a forum entry, retrieve 
         * the existing tags, and send them all back with the new tag in the update request.
         * 
         * @method updateForumTopic
         * @param {Object} topicOrJson Forum topic object
         * @param {Object} [args] Argument object
         */
        updateForumTopic : function(topicOrJson,args) {
            var forumTopic = this._toForumTopic(topicOrJson);
            var promise = this._validateForumTopic(forumTopic, true, args);
            if (promise) {
                return promise;
            }
            
            var callbacks = {};
            callbacks.createEntity = function(service,data,response) {
            	// preserve the topicUuid
            	var topicUuid = forumTopic.getTopicUuid();
            	forumTopic.setData(data);
            	forumTopic.setTopicUuid(topicUuid);
                return forumTopic;
            };

            var requestArgs = lang.mixin({
                topicUuid : forumTopic.getTopicUuid()
            }, args || {});
            
            var options = {
                method : "PUT",
                query : requestArgs,
                headers : consts.AtomXmlHeaders,
                data : forumTopic.createPostData()
            };
            
            return this.updateEntity(consts.AtomTopic, options, callbacks, args);
        },

        /**
         * Delete a forum topic, use the HTTP DELETE method.
         * Only the owner of a forum topic can delete it. Deleted forum topics cannot be restored
         * 
         * @method deleteForumTopic
         * @param {String/Object} id of the forum topic to be deleted
         * @param {Object} [args] Argument object
         */
        deleteForumTopic : function(topicUuid,args) {
            var promise = this._validateTopicUuid(topicUuid);
            if (promise) {
                return promise;
            }            
           
            var requestArgs = lang.mixin({
                topicUuid : topicUuid
            }, args || {});
            
            var options = {
                method : "DELETE",
                query : requestArgs,
                handleAs : "text"
            };
            
            return this.deleteEntity(consts.AtomTopic, options, topicUuid);
        },
        
        /**
         * Retrieve a forum reply entry, use the edit link for the forum reply entry 
         * which can be found in the my communities feed.
         * 
         * @method getForumReply
         * @param {String } replyUuid
         * @param {Object} args Object containing the query arguments to be 
         * sent (defined in IBM Connections Communities REST API) 
         */
        getForumReply : function(replyUuid, args) {
            var forumReply = new ForumReply({
                service : this,
                _fields : { replyUuid : replyUuid }
            });
            return forumReply.load(args);
        },

        /**
         * Create a forum reply by sending an Atom entry document containing the 
         * new forum reply to the My Communities resource.
         * 
         * @method createForumReply
         * @param {Object} reply ForumReply object which denotes the forum to be created.
         * @param {Object} [args] Argument object
         */
        createForumReply : function(replyOrJson,args) {
            var forumReply = this._toForumReply(replyOrJson);
            var promise = this._validateForumReply(forumReply, false, args);
            if (promise) {
                return promise;
            }

            var callbacks = {};
            callbacks.createEntity = function(service,data,response) {
                var replyUuid = this.getLocationParameter(response, "replyUuid");
                forumReply.setReplyUuid(replyUuid);
                forumReply.setData(data);
                return forumReply;
            };

            var options = {
                method : "POST",
                query : args || { topicUuid : forumReply.getTopicUuid() },
                headers : consts.AtomXmlHeaders,
                data : forumReply.createPostData()
            };
            
            return this.updateEntity(consts.AtomReplies, options, callbacks, args);
        },

        /**
         * Update a forum by sending a replacement forum entry document in Atom format 
         * to the existing forum's edit web address.
         * All existing forum entry information will be replaced with the new data. To avoid 
         * deleting all existing data, retrieve any data you want to retain first, and send it back 
         * with this request. For example, if you want to add a new tag to a forum entry, retrieve 
         * the existing tags, and send them all back with the new tag in the update request.
         * 
         * @method updateForumReply
         * @param {Object} replyOrJson Forum reply object
         * @param {Object} [args] Argument object
         */
        updateForumReply : function(replyOrJson,args) {
            var forumReply = this._toForumReply(replyOrJson);
            var promise = this._validateForumReply(forumReply, true, args);
            if (promise) {
                return promise;
            }
            
            var callbacks = {};
            callbacks.createEntity = function(service,data,response) {
            	// preserve the replyUuid
            	var replyUuid = forumReply.getReplyUuid();
            	forumReply.setData(data);
            	forumReply.setReplyUuid(replyUuid);
                return forumReply;
            };

            var requestArgs = lang.mixin({
            	replyUuid : forumReply.getReplyUuid()
            }, args || {});
            
            var options = {
                method : "PUT",
                query : requestArgs,
                headers : consts.AtomXmlHeaders,
                data : forumReply.createPostData()
            };
            
            return this.updateEntity(consts.AtomReply, options, callbacks, args);
        },

        /**
         * Delete a forum reply, use the HTTP DELETE method.
         * Only the owner of a forum reply can delete it. Deleted forum replies cannot be restored
         * 
         * @method deleteForumReply
         * @param {String/Object} Id of the forum reply to be deleted
         * @param {Object} [args] Argument object
         */
        deleteForumReply : function(replyUuid,args) {
            var promise = this._validateReplyUuid(replyUuid);
            if (promise) {
                return promise;
            }            
           
            var requestArgs = lang.mixin({
            	replyUuid : replyUuid
            }, args || {});
            
            var options = {
                method : "DELETE",
                query : requestArgs,
                handleAs : "text"
            };
            
            return this.deleteEntity(consts.AtomReply, options, replyUuid);
        },
        
        //
        // Internals
        //
        
        /*
         * Validate a forum and return a Promise if invalid.
         */
        _validateForum : function(forum,checkUuid) {
            if (!forum || !forum.getTitle()) {
                return this.createBadRequestPromise("Invalid argument, forum with title must be specified.");
            }
            if (checkUuid && !forum.getForumUuid()) {
                return this.createBadRequestPromise("Invalid argument, forum with UUID must be specified.");
            }
        },
        
        /*
         * Validate a forum topic and return a Promise if invalid.
         */
        _validateForumTopic : function(forumTopic,checkUuid) {
            if (!forumTopic || !forumTopic.getTitle()) {
                return this.createBadRequestPromise("Invalid argument, forum topic with title must be specified.");
            }
            if (checkUuid && !forumTopic.getTopicUuid()) {
                return this.createBadRequestPromise("Invalid argument, forum topic with UUID must be specified.");
            }
        },
        
        /*
         * Validate a forum reply and return a Promise if invalid.
         */
        _validateForumReply : function(forumReply,checkUuid) {
            if (!forumReply || !forumReply.getTitle()) {
                return this.createBadRequestPromise("Invalid argument, forum reply with title must be specified.");
            }
            if (checkUuid && !forumReply.getReplyUuid()) {
                return this.createBadRequestPromise("Invalid argument, forum reply with UUID must be specified.");
            }
        },
        
        /*
         * Validate a forum UUID, and return a Promise if invalid.
         */
        _validateForumUuid : function(forumUuid) {
            if (!forumUuid || forumUuid.length == 0) {
                return this.createBadRequestPromise("Invalid argument, expected forumUuid.");
            }
        },
        
        /*
         * Validate a topic UUID, and return a Promise if invalid.
         */
        _validateTopicUuid : function(topicUuid) {
            if (!topicUuid || topicUuid.length == 0) {
                return this.createBadRequestPromise("Invalid argument, expected topicUuid.");
            }
        },
        
        /*
         * Validate a reply UUID, and return a Promise if invalid.
         */
        _validateReplyUuid : function(replyUuid) {
            if (!replyUuid || replyUuid.length == 0) {
                return this.createBadRequestPromise("Invalid argument, expected replyUuid.");
            }
        },
        
        /*
         * Return a Forum instance from Forum or JSON or String. Throws
         * an error if the argument was neither.
         */
        _toForum : function(forumOrJsonOrString) {
            if (forumOrJsonOrString instanceof Forum) {
                return forumOrJsonOrString;
            } else {
                if (lang.isString(forumOrJsonOrString)) {
                    forumOrJsonOrString = {
                        forumUuid : forumOrJsonOrString
                    };
                }
                return new Forum({
                    service : this,
                    _fields : lang.mixin({}, forumOrJsonOrString)
                });
            }
        },

        /*
         * Return a ForumTopic instance from Forum or JSON or String. Throws
         * an error if the argument was neither.
         */
        _toForumTopic : function(topicOrJsonOrString) {
            if (topicOrJsonOrString instanceof ForumTopic) {
                return topicOrJsonOrString;
            } else {
                if (lang.isString(topicOrJsonOrString)) {
                    topicOrJsonOrString = {
                        forumTopicUuid : topicOrJsonOrString
                    };
                }
                return new ForumTopic({
                    service : this,
                    _fields : lang.mixin({}, topicOrJsonOrString)
                });
            }
        },

        /*
         * Return a Forum instance from ForumReply or JSON or String. Throws
         * an error if the argument was neither.
         */
        _toForumReply : function(replyOrJsonOrString) {
            if (replyOrJsonOrString instanceof ForumReply) {
                return replyOrJsonOrString;
            } else {
                if (lang.isString(replyOrJsonOrString)) {
                	replyOrJsonOrString = {
                        forumReplyUuid : replyOrJsonOrString
                    };
                }
                return new ForumReply({
                    service : this,
                    _fields : lang.mixin({}, replyOrJsonOrString)
                });
            }
        }
        
    });
    return ForumService;
});
