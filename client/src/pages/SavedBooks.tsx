import { useQuery, useMutation } from '@apollo/client';
import { QUERY_ME } from '../utils/queries';
import { REMOVE_BOOK } from '../utils/mutations';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';  // Ensure you're importing these
import Auth from '../utils/auth';
import { removeBookId } from '../utils/localStorage';

const SavedBooks = () => {
  // Fetch user data with useQuery hook
  const { data, loading, error } = useQuery(QUERY_ME);

  // Handle book removal with useMutation hook
  const [removeBook, { error: mutationError }] = useMutation(REMOVE_BOOK, {
    // Optimistically update the cache when a book is removed
    update(cache, { data: { removeBook } }) {
      const { me } = cache.readQuery({ query: QUERY_ME });

      cache.writeQuery({
        query: QUERY_ME,
        data: {
          me: {
            ...me,
            savedBooks: me.savedBooks.filter(book => book.bookId !== removeBook.bookId),
          },
        },
      });
    },
  });

  // Loading state while waiting for data
  if (loading) {
    return <h2>Loading...</h2>;
  }

  // Error handling for fetching user data
  if (error) {
    return <h2>Error: {error.message}</h2>;
  }

  // Function to handle book deletion
  const handleDeleteBook = async (bookId: string) => {
    const token = Auth.loggedIn() ? Auth.getToken() : null;

    if (!token) {
      return false;
    }

    try {
      // Call the mutation to remove the book
      const { data } = await removeBook({ variables: { bookId } });

      // Remove the book from localStorage
      removeBookId(bookId);
    } catch (err) {
      console.error('Error deleting book:', err);
    }
  };
  // if data isn't here yet, say so
  if (loading) {
    return <h2>LOADING...</h2>;
  }

  return (
    <>
      <div className='text-light bg-dark p-5'>
        <Container>
           (
            <h1>Viewing {userData.username}'s saved books!</h1>
          ) : (
            <h1>Viewing saved books!</h1>
          )
        </Container>
      </div>
      <Container>
        <h2 className='pt-5'>
          {userData.savedBooks.length
            ? `Viewing ${userData.savedBooks.length} saved ${
                userData.savedBooks.length === 1 ? 'book' : 'books'
              }:`
            : 'You have no saved books!'}
        </h2>
        <Row>
          {userData.savedBooks.map((book) => {
            return (
              <Col md='4'>
                <Card key={book.bookId} border='dark'>
                  {book.image ? (
                    <Card.Img
                      src={book.image}
                      alt={`The cover for ${book.title}`}
                      variant='top'
                    />
                  ) : null}
                  <Card.Body>
                    <Card.Title>{book.title}</Card.Title>
                    <p className='small'>Authors: {book.authors}</p>
                    <Card.Text>{book.description}</Card.Text>
                    <Button
                      className='btn-block btn-danger'
                      onClick={() => handleDeleteBook(book.bookId)}
                    >
                      Delete this Book!
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>
      </Container>
    </>
  );
};

export default SavedBooks;
