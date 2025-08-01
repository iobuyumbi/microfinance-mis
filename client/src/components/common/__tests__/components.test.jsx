import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { toast } from "sonner";
import DataTable from "../DataTable";
import Form from "../Form";
import Modal, { ConfirmModal, AlertModal, FormModal } from "../Modal";
import LoadingSpinner, {
  PageLoader,
  TableLoader,
  ButtonLoader,
} from "../LoadingSpinner";
import EmptyState, {
  NoDataEmptyState,
  NoResultsEmptyState,
  ErrorEmptyState,
} from "../EmptyState";

// Mock sonner
jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock store
const createMockStore = () =>
  configureStore({
    reducer: {
      auth: (state = { user: null, isAuthenticated: false }, action) => state,
    },
  });

// Test wrapper component
const TestWrapper = ({ children }) => (
  <Provider store={createMockStore()}>
    <BrowserRouter>{children}</BrowserRouter>
  </Provider>
);

describe("DataTable Component", () => {
  const mockData = [
    { id: 1, name: "John Doe", email: "john@example.com", role: "admin" },
    { id: 2, name: "Jane Smith", email: "jane@example.com", role: "member" },
  ];

  const mockColumns = [
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "role", label: "Role" },
  ];

  test("renders table with data", () => {
    render(
      <TestWrapper>
        <DataTable data={mockData} columns={mockColumns} />
      </TestWrapper>
    );

    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("Jane Smith")).toBeInTheDocument();
    expect(screen.getByText("john@example.com")).toBeInTheDocument();
  });

  test("shows loading state", () => {
    render(
      <TestWrapper>
        <DataTable data={[]} columns={mockColumns} loading={true} />
      </TestWrapper>
    );

    expect(screen.getByText("Loading data...")).toBeInTheDocument();
  });

  test("shows error state", () => {
    render(
      <TestWrapper>
        <DataTable data={[]} columns={mockColumns} error="Failed to load" />
      </TestWrapper>
    );

    expect(screen.getByText("Failed to load")).toBeInTheDocument();
  });

  test("shows empty state", () => {
    render(
      <TestWrapper>
        <DataTable data={[]} columns={mockColumns} />
      </TestWrapper>
    );

    expect(screen.getByText("No data available")).toBeInTheDocument();
  });

  test("handles search", () => {
    render(
      <TestWrapper>
        <DataTable data={mockData} columns={mockColumns} searchable={true} />
      </TestWrapper>
    );

    const searchInput = screen.getByPlaceholderText("Search...");
    fireEvent.change(searchInput, { target: { value: "John" } });

    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.queryByText("Jane Smith")).not.toBeInTheDocument();
  });

  test("handles row actions", () => {
    const mockAction = jest.fn();
    const rowActions = [{ label: "Edit", onClick: mockAction }];

    render(
      <TestWrapper>
        <DataTable
          data={mockData}
          columns={mockColumns}
          rowActions={rowActions}
        />
      </TestWrapper>
    );

    const actionButtons = screen.getAllByText("Edit");
    fireEvent.click(actionButtons[0]);

    expect(mockAction).toHaveBeenCalledWith(mockData[0]);
  });
});

describe("Form Component", () => {
  const mockFields = [
    {
      name: "name",
      label: "Name",
      type: "text",
      required: true,
    },
    {
      name: "email",
      label: "Email",
      type: "email",
      required: true,
    },
  ];

  test("renders form fields", () => {
    render(
      <TestWrapper>
        <Form fields={mockFields} onSubmit={jest.fn()} />
      </TestWrapper>
    );

    expect(screen.getByLabelText("Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
  });

  test("handles form submission", async () => {
    const mockSubmit = jest.fn();
    render(
      <TestWrapper>
        <Form fields={mockFields} onSubmit={mockSubmit} />
      </TestWrapper>
    );

    fireEvent.change(screen.getByLabelText("Name"), {
      target: { value: "John Doe" },
    });
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "john@example.com" },
    });
    fireEvent.click(screen.getByText("Submit"));

    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalledWith({
        name: "John Doe",
        email: "john@example.com",
      });
    });
  });

  test("shows validation errors", async () => {
    const validationSchema = {
      name: { required: "Name is required" },
    };

    render(
      <TestWrapper>
        <Form
          fields={mockFields}
          onSubmit={jest.fn()}
          validationSchema={validationSchema}
        />
      </TestWrapper>
    );

    fireEvent.click(screen.getByText("Submit"));

    await waitFor(() => {
      expect(screen.getByText("Name is required")).toBeInTheDocument();
    });
  });

  test("shows loading state", () => {
    render(
      <TestWrapper>
        <Form fields={mockFields} onSubmit={jest.fn()} loading={true} />
      </TestWrapper>
    );

    expect(screen.getByText("Submit")).toBeDisabled();
  });
});

describe("Modal Component", () => {
  test("renders modal when open", () => {
    render(
      <TestWrapper>
        <Modal open={true} onOpenChange={jest.fn()} title="Test Modal">
          <p>Modal content</p>
        </Modal>
      </TestWrapper>
    );

    expect(screen.getByText("Test Modal")).toBeInTheDocument();
    expect(screen.getByText("Modal content")).toBeInTheDocument();
  });

  test("does not render when closed", () => {
    render(
      <TestWrapper>
        <Modal open={false} onOpenChange={jest.fn()} title="Test Modal">
          <p>Modal content</p>
        </Modal>
      </TestWrapper>
    );

    expect(screen.queryByText("Test Modal")).not.toBeInTheDocument();
  });

  test("handles confirm action", async () => {
    const mockConfirm = jest.fn();
    render(
      <TestWrapper>
        <Modal
          open={true}
          onOpenChange={jest.fn()}
          title="Test Modal"
          onConfirm={mockConfirm}
          confirmText="Save"
        >
          <p>Modal content</p>
        </Modal>
      </TestWrapper>
    );

    fireEvent.click(screen.getByText("Save"));
    expect(mockConfirm).toHaveBeenCalled();
  });

  test("handles cancel action", () => {
    const mockCancel = jest.fn();
    render(
      <TestWrapper>
        <Modal
          open={true}
          onOpenChange={jest.fn()}
          title="Test Modal"
          onCancel={mockCancel}
          cancelText="Cancel"
        >
          <p>Modal content</p>
        </Modal>
      </TestWrapper>
    );

    fireEvent.click(screen.getByText("Cancel"));
    expect(mockCancel).toHaveBeenCalled();
  });
});

describe("ConfirmModal Component", () => {
  test("renders confirmation dialog", () => {
    render(
      <TestWrapper>
        <ConfirmModal
          open={true}
          onOpenChange={jest.fn()}
          title="Confirm Delete"
          description="Are you sure?"
          onConfirm={jest.fn()}
        />
      </TestWrapper>
    );

    expect(screen.getByText("Confirm Delete")).toBeInTheDocument();
    expect(screen.getByText("Are you sure?")).toBeInTheDocument();
    expect(screen.getByText("Confirm")).toBeInTheDocument();
    expect(screen.getByText("Cancel")).toBeInTheDocument();
  });
});

describe("LoadingSpinner Component", () => {
  test("renders spinner", () => {
    render(<LoadingSpinner />);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  test("renders with text", () => {
    render(<LoadingSpinner text="Loading..." />);
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  test("renders full screen loader", () => {
    render(<LoadingSpinner fullScreen text="Loading page..." />);
    expect(screen.getByText("Loading page...")).toBeInTheDocument();
  });

  test("renders different variants", () => {
    const { rerender } = render(<LoadingSpinner variant="dots" />);
    expect(screen.getByRole("status")).toBeInTheDocument();

    rerender(<LoadingSpinner variant="pulse" />);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });
});

describe("PageLoader Component", () => {
  test("renders page loader", () => {
    render(<PageLoader />);
    expect(screen.getByText("Loading page...")).toBeInTheDocument();
  });

  test("renders with custom text", () => {
    render(<PageLoader text="Custom loading text" />);
    expect(screen.getByText("Custom loading text")).toBeInTheDocument();
  });
});

describe("TableLoader Component", () => {
  test("renders table loader", () => {
    render(<TableLoader />);
    expect(screen.getByText("Loading data...")).toBeInTheDocument();
  });
});

describe("ButtonLoader Component", () => {
  test("renders button loader", () => {
    render(<ButtonLoader />);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });
});

describe("EmptyState Component", () => {
  test("renders empty state", () => {
    render(<EmptyState title="No data" description="No data available" />);
    expect(screen.getByText("No data")).toBeInTheDocument();
    expect(screen.getByText("No data available")).toBeInTheDocument();
  });

  test("renders with action", () => {
    const mockAction = jest.fn();
    render(
      <EmptyState
        title="No data"
        description="No data available"
        action={{
          label: "Add Item",
          onClick: mockAction,
        }}
      />
    );

    fireEvent.click(screen.getByText("Add Item"));
    expect(mockAction).toHaveBeenCalled();
  });

  test("renders with icon", () => {
    render(<EmptyState icon="📊" title="No data" />);
    expect(screen.getByText("📊")).toBeInTheDocument();
  });
});

describe("NoDataEmptyState Component", () => {
  test("renders no data state", () => {
    render(<NoDataEmptyState />);
    expect(screen.getByText("No data available")).toBeInTheDocument();
  });
});

describe("NoResultsEmptyState Component", () => {
  test("renders no results state", () => {
    render(<NoResultsEmptyState />);
    expect(screen.getByText("No results found")).toBeInTheDocument();
  });

  test("renders with search term", () => {
    render(<NoResultsEmptyState searchTerm="test" />);
    expect(screen.getByText('No results found for "test"')).toBeInTheDocument();
  });
});

describe("ErrorEmptyState Component", () => {
  test("renders error state", () => {
    render(<ErrorEmptyState error="Something went wrong" />);
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
  });

  test("renders with retry action", () => {
    const mockRetry = jest.fn();
    render(<ErrorEmptyState onRetry={mockRetry} />);

    fireEvent.click(screen.getByText("Try again"));
    expect(mockRetry).toHaveBeenCalled();
  });
});

describe("Component Integration", () => {
  test("DataTable with loading state shows LoadingSpinner", () => {
    render(
      <TestWrapper>
        <DataTable data={[]} columns={[]} loading={true} />
      </TestWrapper>
    );

    expect(screen.getByText("Loading data...")).toBeInTheDocument();
  });

  test("DataTable with error state shows ErrorEmptyState", () => {
    render(
      <TestWrapper>
        <DataTable data={[]} columns={[]} error="Failed to load" />
      </TestWrapper>
    );

    expect(screen.getByText("Failed to load")).toBeInTheDocument();
  });

  test("Form in Modal works correctly", async () => {
    const mockSubmit = jest.fn();
    const mockClose = jest.fn();

    render(
      <TestWrapper>
        <FormModal
          open={true}
          onOpenChange={mockClose}
          title="Test Form"
          onConfirm={mockSubmit}
        >
          <Form
            fields={[
              { name: "name", label: "Name", type: "text", required: true },
            ]}
            onSubmit={mockSubmit}
          />
        </FormModal>
      </TestWrapper>
    );

    fireEvent.change(screen.getByLabelText("Name"), {
      target: { value: "Test" },
    });
    fireEvent.click(screen.getByText("Save"));

    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalled();
    });
  });
});
