const express = require("express");
const { graphqlHTTP } = require("express-graphql");
const mongoose = require("mongoose");
const {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLList,
  GraphQLNonNull,
} = require("graphql");

const app = express();
const PORT = 8000;

// Connect to MongoDB
mongoose.connect("mongodb+srv://graphql:graphql@app.tzveal3.mongodb.net/graphql?retryWrites=true&w=majority").then(()=>{
    return console.log("db connected");
})

const bookSchema = mongoose.Schema({
  title: String,
  author: String,
});

const Book = mongoose.model("Book", bookSchema);

const bookType = new GraphQLObjectType({
  name: "Book",
  fields: () => ({
    id: {
      type: GraphQLNonNull(GraphQLString),
    },
    title: {
      type: GraphQLNonNull(GraphQLString),
    },
    author: {
      type: GraphQLNonNull(GraphQLString),
    },
  }),
});

const RootQuery = new GraphQLObjectType({
  name: "RootQuery",
  fields: {
    books: {
      type: GraphQLList(bookType),
      resolve: async () => {
        let books = await Book.find({});
        return books;
      },
    },
  },
});

const Mutation = new GraphQLObjectType({
  name: "Mutation",
  fields: {
    addBook: {
      type: bookType,
      args: {
        title: {
          type: GraphQLNonNull(GraphQLString),
        },
        author: {
          type: GraphQLNonNull(GraphQLString),
        },
      },
      resolve: async (_, { title, author }) => {
        const book = new Book({
          title,
          author,
        });
        await book.save();
        return book;
      },
    },
    updateBook: {
      type: bookType,
      args: {
        id: {
          type: GraphQLNonNull(GraphQLString),
        },
        title: {
          type: GraphQLNonNull(GraphQLString),
        },
        author: {
          type: GraphQLNonNull(GraphQLString),
        },
      },
      resolve: async (_, { id, title, author }) => {
        const updatedBook = await Book.findByIdAndUpdate(
          id,
          { title, author },
          { new: true }
        );
        return updatedBook;
      },
    },
  },
});

const schema = new GraphQLSchema({
  query: RootQuery,
  mutation: Mutation,
});

app.use(
  "/graphql",
  graphqlHTTP({
    schema: schema,
    graphiql: true,
  })
);

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}/graphql`);
});

