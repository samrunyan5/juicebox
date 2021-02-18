const {client, getAllUsers, getAllPosts, createUser, createPost, updateUser, updatePost, getUserById, createTags, addTagsToPost, getPostsByTagName} = require('./index');

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
            content: "Blah blah this is post number one.",
            tags: ['#happy', '#youcandoanything']
        });
        await createPost({
            authorId: sandra.id,
            title: "Sandra's Post",
            content: "Want to buy a cat???",
            tags: ['#happy', '#worst-day-ever']
        });
        await createPost({
            authorId: glamgal.id,
            title: "Wine for Sale",
            content: "Very sweet AND very delicious.",
            tags: ['#happy', '#youcandoanything', '#catmandoanything']
        });
    } catch (error) {
        throw error;
    }
}

async function dropTables() {
    try {
        await client.query(`
            DROP TABLE IF EXISTS post_tags;
            DROP TABLE IF EXISTS tags;
            DROP TABLE IF EXISTS posts;
            DROP TABLE IF EXISTS users;
        `);
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
        `);
        await client.query(`
            CREATE TABLE tags (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) UNIQUE NOT NULL
            );
        `);
        await client.query(`
            CREATE TABLE post_tags (
                "postId" INTEGER REFERENCES posts(id),
                "tagId" INTEGER REFERENCES tags(id),
                UNIQUE ("postId", "tagId")
            )
        `);
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

        const updatePostTagResult = await updatePost(posts[0].id, {
            tags: ['redfish', 'bluefish']
        });
        console.log('update post tag: ', updatePostTagResult)

        const happyPost = await getPostsByTagName('#happy')
        console.log('happy: ', happyPost)
    } catch (error) {
        console.error(error);
    }
}


rebuildDB()
    .then(testDB)
    .catch(console.error)
    .finally(() => client.end());