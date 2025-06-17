
/*

Map: stores key-value pair
Set: stores list of unique data

----

rooms:: 
	- will store rooms_name as key 
	- value will be stores as list/set of ws clients
{ "rooms_name", new Set["ws1", "ws2"]}

users_name::
	- will store users_name mapping to their ws-client
	- websocket_client => registered_username
{["ws1", "alice"], ["ws2", "bear"]}

*/

const state = {
	rooms: new Map,
	users_name: new Map,
}

;(function createDefaultRooms() {
	state.rooms.set("room1", new Set());
	state.rooms.set("room2", new Set());
	state.rooms.set("room3", new Set());
})()

export { state }
