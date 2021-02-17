const {client, getAllUsers, getAllPosts, createUser, createPost, updateUser, updatePost, getUserById} = require('./index');

async function createInitialUsers() {
    try {
        await createUser({username: 'albert', password: 'bertie99', name: 'Albert', location: 'FL'});
        await createUser({username: 'sandra', password: '2sandy4me', name: 'Sandra', location: 'TX'});
        await createUser({username: 'glamgal', password: 'soglam', name: 'Tiffany', location: 'CA'})
    } catch (error) {
        throw error;
    }
}

async function createInitialPosts() {
    try {
        const [albert, sandra, glamgal] = await getAllUsers();

        await createPost({
            authorId: albert.id,
            title: "First Post",
            content: "Blah blah this is post number one."
        });
        await createPost({
            authorId: sandra.id,
            title: "Sandra's Post",
            content: "Want to buy a cat???"
        });
        await createPost({
            authorId: glamgal.id,
            title: "Wine for Sale",
            content: "Very sweet AND very delicious."
        });
    } catch (error) {
        throw error;
    }
}

async function dropTables() {
    try {
        await client.query(`DROP TABLE IF EXISTS posts;`);
        await client.query(`DROP TABLE IF EXISTS users;`);
    } catch (error) {
        throw error;
    }
}

async function createTables() {
    try {
        await client.query(`
            CREATE TABLE users (
                id SERIAL PRIMARY KEY,
                username VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                name VARCHAR(255) NOT NULL,
                location VARCHAR(255) NOT NULL,
                active BOOLEAN DEFAULT true
            );
        `);
        await client.query(`
            CREATE TABLE posts (
                id SERIAL PRIMARY KEY,
                "authorId" INTEGER REFERENCES users(id) NOT NULL,
                title VARCHAR(255) NOT NULL,
                content TEXT NOT NULL,
                active BOOLEAN DEFAULT true
            );
        `)
    } catch (error) {
        throw error;
    }
}

async function rebuildDB() {
    try {
        client.connect();

        await dropTables();
        await createTables();
        await createInitialUsers();
        await createInitialPosts();
    } catch (error) {
        console.error(error);
    }
}

async function testDB() {
    try {
        const users = await getAllUsers();
        console.log('users: ', users);

        const updateUserResult = await updateUser(users[0].id, {
            name: "Midas",
            location: "IN"
        });
        console.log('update: ', updateUserResult)

        const posts = await getAllPosts();
        console.log('posts: ', posts)

        const updatePostResult = await updatePost(posts[0].id, {
            title: 'New Title',
            content: 'Some newer message.'
        });
        console.log('update post result: ', updatePostResult)

        const albert = await getUserById(1);
        console.log('albert: ', albert)
    } catch (error) {
        console.error(error);
    }
}


rebuildDB()
    .then(testDB)
    .catch(console.error)
    .finally(() => client.end());