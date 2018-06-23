'use strict';

const WEI = 1000000000000000000;
const ADMIN_ADDR = 'n1M5Hr6BXV5Spkr8fNGvi8N9n8oX1wRXF4E';

function _randomStr() {
    return +new Date() + Math.random().toString(36).substr(7);
}

function _requireParams(fields, obj) {
    fields.forEach(f => {
        if (obj[f] === null || typeof obj[f] === 'undefined') {
            throw `${f} is missing.`;
        }
    });
}

function _equals(obj1, obj2, keys) {
    const key = keys[0];
    if (!key) return true;

    if (obj1[key] !== obj2[key]) {
        return false;
    } else {
        return _equals(obj1, obj2, keys.slice(1));
    }
}

function _find(list, predicate) {
    const keys = Object.keys(predicate);
    let res = null;
    for (const i in list) {
        const el = list[i];
        if (_equals(el, predicate, keys)) {
            res = el;
            break;
        }
    }
    return res;
}

// function _filterMap(mapData, filter) {
//   const fields = Object.keys(filter);
//   const map = {};
//   for (let key in mapData) {
//
//   }
// }

function _isEmpty(obj, key) {
    return !obj.hasOwnProperty(key) || (obj[key] === null || typeof obj[key] === 'undefined');
}

function _stringifyDict(dict) {
    if (!dict) return null;
    const idsDict = {};
    for (const id in dict) {
        idsDict[id] = 1;
    }
    return JSON.stringify(idsDict);
}

function _parseToDict(str, db) {
    if (!str) return {};
    const dict = JSON.parse(str);
    for (const id in dict) {
        dict[id] = db.get(id);
    }
    return dict;
}

function _dictToArray(dict) {
    const keys = Object.keys(dict);
    return keys.map(key => dict[key]);
}

// class Object {
//   constructor() {
//     return this;
//   }
//
//   requireParams(fields, obj) {
//     _requireParams(fields, obj || this);
//   }
//
//   toJSON() {
//     return JSON.parse(JSON.stringify(this));
//   }
// }

class Post {
    constructor({
        amount,
        minimumAmount,
        type,
        price,
        posterAddr,
        createdAt,
        id,
        status,
        notes,
        holdingAmount,
        originAmount
    }) {
        this.originAmount = originAmount; // not change after created
        this.amount = amount; // dynamic
        this.minimumAmount = minimumAmount;
        this.holdingAmount = holdingAmount || 0;

        this.price = price;
        this.posterAddr = posterAddr;
        this.createdAt = createdAt || +new Date();
        this.type = type; // 1: sell 2: buy

        // NOT USED
        // 1: visible
        // 21: deleted by poster
        // 22: deleted by admin
        this.status = status || 1;

        this.id = id || _randomStr();

        if (notes) {
            this.notes = notes;
        }

        _requireParams(['amount', 'minimumAmount', 'price', 'posterAddr', 'type', 'originAmount'], this);

        return this;
    }

    removeFromAvailablePosts(exchange) {
        const postsDict = exchange.postsDict || {};
        delete postsDict[this.id];
        exchange.postsDict = postsDict;
    }

    includeUser(exchange, fields) {
        const poster = exchange.users.get(this.posterAddr);
        this.poster = {};

        if (fields && fields.length) {
            fields.forEach(f => {
                this.poster[f] = poster[f];
            });
        } else {
            this.poster = poster;
        }

        return this;
    }
}

class Order {
    constructor({
        buyerAddr,
        sellerAddr,
        createdAt,
        id,
        amount,
        price,
        status,
        postId,
        hadDisputation,
        autoBuyerConfirmed
    }) {
        this.buyerAddr = buyerAddr;
        this.sellerAddr = sellerAddr;
        this.createdAt = createdAt || +new Date();
        this.id = id || _randomStr();
        this.amount = amount;
        this.price = price;
        this.postId = postId;

        // 1: initiated 2: cancelled 3: one confirm 4: two confirm 5. in dispute
        this.status = status || 1;

        this.hadDisputation = hadDisputation || false;
        this.autoBuyerConfirmed = autoBuyerConfirmed || false;

        _requireParams(['buyerAddr', 'sellerAddr',
            'amount', 'price', 'postId'
        ], this);

        return this;
    }

    onOrderCancelled(exchange, by) {
        // update post
        const post = exchange.posts.get(this.postId);

        if (!post) throw `post ${this.postId} not found`;

        // if the order was created for a buy post
        // the tokens should be returned when the order is canceled
        if (post.type === 2) {
            const res = Blockchain.transfer(this.sellerAddr, this.amount * WEI);
            if (res !== true) throw `returning ${this.amount} NAS to ${this.sellerAddr} fails when canceling order ${this.id}`;
        }

        by.cancelledOrdersCount += 1;
        exchange.users.set(by.addr, by);

        post.holdingAmount = 0;
        exchange.posts.set(this.postId, post);
    }

    onOrderCompleted(exchange) {
        const value = new BigNumber(this.amount * WEI);
        const res = Blockchain.transfer(this.buyerAddr, value);
        if (res !== true) {
            throw `${res}: failed to transfer token to the buyer ${this.buyerAddr}`;
        }

        // Update user.completedOrdersCount
        const buyer = exchange.users.get(this.buyerAddr);
        const seller = exchange.users.get(this.sellerAddr);
        buyer.completedOrdersCount += 1;
        seller.completedOrdersCount += 1;
        exchange.users.set(buyer.addr, buyer);
        exchange.users.set(seller.addr, seller);

        // Update post.amount and holdingAmount
        const post = exchange.posts.get(this.postId);
        post.holdingAmount = 0;
        post.amount -= this.amount;
        if (post.amount < 0) post.amount = 0;
        exchange.posts.set(post.id, post);

        if (post.amount === 0) {
            // remove from postsArr
            post.removeFromAvailablePosts(exchange);
        }

        // @TODO
        // Send notifications to the buyer and seller that
        // the transaction is completed.
    }
}

class User {
    constructor({
        addr,
        username,
        photoUrl,
        id,
        cancelledOrdersCount,
        completedOrdersCount,
        phone,
        email,
        alipay,
        password,
        name
    }) {
        this.addr = addr;
        this.username = username;

        if (password) {
            this.password = password;
        }

        if (name) {
            this.name = name;
        }

        if (photoUrl) {
            this.photoUrl = photoUrl;
        }
        if (phone) {
            this.phone = phone;
        }
        if (email) {
            this.email = email;
        }
        if (alipay) {
            this.alipay = alipay;
        }

        this.id = id || _randomStr();
        this.cancelledOrdersCount = cancelledOrdersCount || 0;
        this.completedOrdersCount = completedOrdersCount || 0;

        _requireParams(['addr', 'username'], this);

        return this;
    }

    get totalOrdersCount() {
        return this.cancelledOrdersCount + this.completedOrdersCount;
    }

    get completedOrdersPercent() {
        if (!this.totalOrdersCount) return 0;
        return 100 * this.completedOrdersCount / this.totalOrdersCount;
    }
}

class Exchange {
    constructor() {
        const _this = this;

        /**
         * @key userAddr
         * @value user
         */
        LocalContractStorage.defineMapProperty(this, 'users', {
            parse(str) {
                if (!str) return null;
                const obj = JSON.parse(str);
                return new User(obj);
            }
        });

        /**
         * @key order id,
         * @value order
         */
        LocalContractStorage.defineMapProperty(this, 'orders', {
            parse(str) {
                if (!str) return null;
                const obj = JSON.parse(str);
                return new Order(obj);
            }
        });

        /**
         * @key post id,
         * @value post
         */
        LocalContractStorage.defineMapProperty(this, 'posts', {
            parse(str) {
                if (!str) return null;
                const obj = JSON.parse(str);
                return new Post(obj);
            }
        });

        /**
         * dictionary of post ids {<id>: true}
         */
        LocalContractStorage.defineProperty(this, 'postsDict', {
            parse(str) {
                return _parseToDict(str, _this.posts);
            },
            stringify: _stringifyDict
        });

        /**
         * @key userAddr
         * @value {<orderId>: 1}
         */
        LocalContractStorage.defineMapProperty(this, 'userOrders', {
            parse(str) {
                return _parseToDict(str, _this.orders);
            },
            stringify: _stringifyDict
        });

        /**
         * @key userAddr
         * @value {<postId>: 1}
         */
        LocalContractStorage.defineMapProperty(this, 'userPosts', {
            parse(str) {
                return _parseToDict(str, _this.posts);
            },
            stringify: _stringifyDict
        });
    }

    init() {
        // Set interval run every 3 days;
        // const loop = 3 * 24 * 3600 * 1000;
        // setInterval(() => {
        //   this._processActions(loop);
        // }, loop);
    }

    accept() {}

    getUser(filter) {
        let addr = Blockchain.transaction.from;

        if (filter && filter.addr) {
            addr = filter.addr;
        }
        return this.users.get(addr);
    }

    // Create or update user
    saveUser(data) {
        const addr = Blockchain.transaction.from;
        data.addr = addr;
        const fields = ['username', 'photoUrl', 'phone', 'email', 'alipay', 'password', 'name'];

        let user = this.users.get(addr);
        if (user) {
            // Update user
            fields.forEach(f => {
                if (!_isEmpty(data, f)) {
                    user[f] = data[f];
                }
            });
        } else {
            // Create user
            user = new User(data);
        }
        this.users.set(addr, user);

        return user;
    }

    /**
     * @param {Dict} filter {id, status<Number>, userAddr}
     * @return {Array} array of the orders
     */
    getOrders(filter) {
        let userAddr = Blockchain.transaction.from;
        if (filter && filter.userAddr) userAddr = filter.userAddr;
        let dictData = this.userOrders.get(userAddr) || {};
        let filteredData = {};

        if (filter) {
            if (filter.hasOwnProperty('id')) {
                dictData = {
                    [filter.id]: dictData[filter.id]
                };
            }
            if (filter.hasOwnProperty('status')) {
                for (const id in dictData) {
                    if (dictData[id].status === filter.status) {
                        filteredData[id] = dictData[id];
                    }
                }
                dictData = filteredData;
                filteredData = {};
            }
        }

        return _dictToArray(dictData);
    }

    /**
     * @param {Dict} filter {id, status<Number>}
     * @return {Array} array of the posts
     */
    getPosts(filter) {
        let userAddr = Blockchain.transaction.from;

        if (filter && filter.posterAddr) {
            userAddr = filter.posterAddr;
        }

        let dictData = this.userPosts.get(userAddr) || {};
        let filteredData = {};

        if (filter) {
            if (filter.hasOwnProperty('id')) {
                dictData = {
                    [filter.id]: dictData[filter.id]
                };
            }
            if (filter.hasOwnProperty('status')) {
                for (const id in dictData) {
                    if (dictData[id].status === filter.status) {
                        filteredData[id] = dictData[id];
                    }
                }
                dictData = filteredData;
                filteredData = {};
            }
        }

        const posts = _dictToArray(dictData);
        const userFields = ['username', 'totalOrdersCount', 'completedOrdersPercent', 'alipay'];
        posts.forEach(p => {
            p.includeUser(this, userFields);
        });

        return posts;
    }

    getAvailablePosts(filter, orderBy, p) {
        const pager = {
            offset: 0,
            limit: 10
        };
        orderBy = orderBy || 'createdAt';
        Object.assign(pager, p || {});
        const postsDict = this.postsDict || {};
        let posts = _dictToArray(postsDict);
        posts = posts.filter(p => p.amount - p.holdingAmount > 0);

        if (filter) {
            if (filter.type) {
                posts = posts.filter(p => p.type === filter.type);
            }
        }

        if (orderBy[0] === '-') {
            orderBy = orderBy.replace('-', '');
            posts = posts.sort((a, b) => b[orderBy] - a[orderBy]);
        } else {
            posts = posts.sort((a, b) => a[orderBy] - b[orderBy]);
        }

        const start = pager.offset * pager.limit;
        const end = pager.limit + start;
        posts = posts.slice(start, end);

        const userFields = ['username', 'totalOrdersCount', 'completedOrdersPercent', 'alipay'];
        for (const post of posts) {
            post.includeUser(this, userFields);
        }

        return posts;
    }

    createPost({
        amount,
        minimumAmount,
        price,
        type
    }) {
        const value = Blockchain.transaction.value;
        const posterAddr = Blockchain.transaction.from;

        if (type === 1) {
            // it is a sell post, the poster needs deposit the amount of NAS to the contract
            if (value.lte(0)) throw `Insufficient value: ${value} to create sell post`;

            amount = Number(value.div(WEI).valueOf());
        }

        const post = new Post({
            amount,
            minimumAmount,
            price,
            type,
            posterAddr,
            originAmount: amount,
            status: 1
        });
        this.posts.set(post.id, post);
        const userPosts = this.userPosts.get(posterAddr) || {};
        userPosts[post.id] = post;
        this.userPosts.set(posterAddr, userPosts);
        const postsDict = this.postsDict || {};
        postsDict[post.id] = post;
        this.postsDict = postsDict;

        return post;
    }

    cancelPost(postId) {
        const userAddr = Blockchain.transaction.from;
        const post = this.posts.get(postId);
        if (!post) throw `post ${postId} not found`;

        if (userAddr !== post.posterAddr && userAddr !== ADMIN_ADDR) throw `user ${userAddr} is not authorized to cancel post ${postId}`;

        if (post.holdingAmount > 0) {
            throw `canceling post ${post.id} fails because there is holding order on the post`;
        }

        post.status = userAddr === ADMIN_ADDR ? 22 : 21;

        // Return the deposit tokens
        if (post.type === 1 && post.amount > 0) {
            const res = Blockchain.transfer(userAddr, new BigNumber(post.amount * WEI));
            if (res !== true) {
                throw `canceling post ${post.id} failed because of the failure of returning tokens.`;
            }
        }

        this.posts.set(post.id, post);

        post.removeFromAvailablePosts(this);

        return post;
    }

    // adminGetUsers() {
    //   const from = Blockchain.transaction.from;
    //   if (from !== ADMIN_ADDR) throw 'not authorized';
    //
    //   return this.users;
    // }
    //
    // adminGetOrders() {
    //   const from = Blockchain.transaction.from;
    //   if (from !== ADMIN_ADDR) throw 'not authorized';
    //
    //   return this.orders;
    // }

    /**
     * @params {dict} options
     * @params {dict} options.responsibleUserAddr
     */
    adminUpdateOrderStatus(orderId, status, options) {
        const userAddr = Blockchain.transaction.from;
        if (userAddr !== ADMIN_ADDR) throw `not authorized`;

        const order = this.orders.get(orderId);
        if (!order) throw `order ${orderId} not found`;

        const previousStatus = order.status;
        // order.status === 5
        order.status = status; // status: 2(cancelled) 4(completed)

        if (order.status === 4) {
            order.onOrderCompleted(this);
        } else if (order.status === 2) {
            if (!options || !options.responsibleUserAddr) throw `responsibleUserAddr is missing`;
            const responsibleUser = this.users.get(options.responsibleUserAddr);
            if (!responsibleUser) throw `responsibleUser ${options.responsibleUserAddr} not found`;
            order.onOrderCancelled(this, responsibleUser);
        }

        this.orders.set(orderId, order);

        const buyer = this.users.get(order.buyerAddr);
        const seller = this.users.get(order.sellerAddr);
        Event.Trigger('OrderStatusChanged', {
            triggeredBy: {
                isAdmin: true
            },
            order: {
                status: order.status,
                previousStatus: previousStatus,
                price: order.price,
                amount: order.amount,
                createdAt: +new Date(),
                buyer: {
                    username: buyer.username
                },
                seller: {
                    username: seller.username
                }
            }
        });

        return {
            id: order.id,
            status: order.status
        };
    }

    updateOrderStatus(orderId, status) {
        const userAddr = Blockchain.transaction.from;
        const user = this.users.get(userAddr);

        const order = this.orders.get(orderId);
        if (!order) throw `order ${orderId} not found`;
        const currOrderStatus = order.status;

        const post = this.posts.get(order.postId);
        if (!post) throw `post ${post.id} not found`;

        order.status = status;

        const seller = this.users.get(order.sellerAddr);
        const buyer = this.users.get(order.buyerAddr);
        // buyer does the first confirmation or cancellation
        if (userAddr === order.buyerAddr) {
            if ((status !== 2 && status !== 3) || currOrderStatus !== 1) throw `invalid order status change ${currOrderStatus} => ${status}`;

            if (status === 3) {
                // @TODO
                // the seller is notified
                // A count down timer of 24 hrs set up. If the seller has no further actions, the contract will transfer the tokens to the buyer
            } else if (status === 2) { // Order is cancelled
                order.onOrderCancelled(this, user);
            }
        } else if (userAddr === order.sellerAddr) {
            if (status === 4 || status === 5) {
                if (currOrderStatus !== 3) throw `invalid order status change ${currOrderStatus} => ${status}`;

                if (status === 4) {
                    order.onOrderCompleted(this);
                } else if (status === 5) { // In disputation
                    order.hadDisputation = true;

                    // @TODO
                    // the admin step in and contract the seller and the buyer to resolve the issue.
                }
            } else if (status === 2) {
                if (currOrderStatus !== 1) throw `invalid order status change ${currOrderStatus} => ${status}`;
                order.onOrderCancelled(this, user);
            } else {
                throw `invalid order status: ${status}`;
            }
        } else {
            throw `${userAddr} is not authorized to change ${orderId}'s status'`;
        }

        this.orders.set(orderId, order);

        Event.Trigger('OrderStatusChanged', {
            triggeredBy: {
                username: user.username
            },
            order: {
                status: order.status,
                previousStatus: currOrderStatus,
                price: order.price,
                amount: order.amount,
                createdAt: +new Date(),
                buyer: {
                    username: buyer.username
                },
                seller: {
                    username: seller.username
                }
            }
        });

        return {
            id: order.id,
            status: order.status
        };
    }

    createOrder({
        amount,
        postId
    }) {
        const userAddr = Blockchain.transaction.from;
        const post = this.posts.get(postId);
        const value = Blockchain.transaction.value;

        if (!post) throw `post ${post.id} not found`;

        const availableAmount = post.amount - post.holdingAmount;

        if (availableAmount <= 0 || post.status !== 1) throw `post ${post.id} is no longer available`;

        if (post.minimumAmount > amount) throw `${amount} is less than the minimum amount ${post.minimumAmount}`;

        if (post.type === 2) {
            // To create an order against a buy post,
            // need to deposit to the contract
            if (value.lte(0)) throw `Insufficient value: ${value} to create order against buy post ${post.id}`;

            amount = Number(value.div(WEI).valueOf());
        }

        const buyerAddr = post.type === 1 ? userAddr : post.posterAddr;
        const sellerAddr = post.type === 1 ? post.posterAddr : userAddr;

        const order = new Order({
            amount,
            price: post.price,
            postId,
            buyerAddr,
            sellerAddr
        });
        this.orders.set(order.id, order);

        // Add to buyer and seller's userOrders
        [buyerAddr, sellerAddr].forEach(addr => {
            const userOrders = this.userOrders.get(addr) || {};
            userOrders[order.id] = order;
            this.userOrders.set(addr, userOrders);
        });

        // update post
        post.holdingAmount = amount;
        this.posts.set(post.id, post);

        // @TODO
        // if the post is a sell post
        // set up a count down timer of 15mins
        // the buyer needs to send the payment in 15mins and confirm payment is made. Otherwise the order will be cancelled

        // if the post is a buyer post
        // set up a count down timer of 1 hour
        // system sends notification to the buyer. the buyer needs to send the payment in 1 hour and confirm payment is made. Otherwise the order will be cancelled

        // due to the length limitation of the receipt.execute_result
        const seller = this.users.get(order.sellerAddr);
        const buyer = this.users.get(order.buyerAddr);
        const user = this.users.get(userAddr);
        Event.Trigger('OrderCreated', {
            triggeredBy: {
                username: user.username
            },
            order: {
                status: order.status,
                price: order.price,
                amount: order.amount,
                createdAt: +new Date(),
                buyer: {
                    username: buyer.username
                },
                seller: {
                    username: seller.username
                }
            }
        });

        return {
            id: order.id,
            createdAt: order.createdAt,
            status: order.status
        };
    }
}

module.exports = Exchange;