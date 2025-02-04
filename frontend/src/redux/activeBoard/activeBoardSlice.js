import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import authorizedAxiosInstance from '~/utils/authorizeAxios'
import { isEmpty } from 'lodash'
import { API_ROOT } from '~/utils/constants'
import { generatePlaceholderCard } from '~/utils/formatters'
import { mapOrder } from '~/utils/sorts'

// Khởi tạo giá trị State của một cái Slice trong redux
const initialState = {
  currentActiveBoard: null
}

// Các hành động gọi API (bất đồng bộ) và cập nhập dữ liệu vào Redux, dùng Middleware createAsysncThunk đi kèm với extraReducers
export const fetchBoardDetailsAPI = createAsyncThunk(
  'activeBoard/fetchBoardDetailsAPI',
  async (boardId) => {
    const response = await authorizedAxiosInstance.get(`${API_ROOT}/v1/boards/${boardId}`)

    // Lưu ý: axios trả kết quả về qua property của nó là data
    return response.data
  }
)


//Khởi tạo một Slice trong kho lưu trữ - Redux Store
export const activeBoardSlice = createSlice({
  name: 'activeBoard',
  initialState,
  // Reducers: Nơi xử lý dữ liệu đồng bộ
  reducers: {
    updateCurrentActiveBoard: (state, action) => {
      // action.payload là chuẩn đặt tên nhận dữ liệu cào reducer, ở đây chúng ta gán cho nó một biến có nghĩa hơn
      const board = action.payload

      // Xử lý dữ liệu nếu cần thiết

      // Update lại dữ liệu của cái currentActiveBoard
      state.currentActiveBoard = board
    },

    updateCardInBoard: (state, action) => {
      // Update nested data
      // https://redux-toolkit.js.org/usage/immer-reducers#updating-nested-data
      const incommingCard = action.payload
      // Tìm dần từ board > column > card
      const column = state.currentActiveBoard.columns.find(column => column._id === incommingCard.columnId)
      if (column) {
        const card = column.cards.find(card => card._id === incommingCard._id)
        if (card) {
          Object.keys(incommingCard).forEach(key => {
            card[key] = incommingCard[key]
          })
        }
      }
    },

    deleteCardInBoard: (state, action) => {
      const deleteCard = action.payload

      // Tìm dần từ board > column > card
      const column = state.currentActiveBoard.columns.find(column => column._id === deleteCard.columnId)
      if (column) {
        const cardIndex = column.cards.findIndex(card => card._id === deleteCard._id)
        if (cardIndex > -1) {
          column.cards.splice(cardIndex, 1)
        }
      }
    }
  },
  // ExtraReducers: Nơi xử lý dữ liệu bất đồng bộ
  extraReducers: (builder) => {
    builder.addCase(fetchBoardDetailsAPI.fulfilled, (state, action) => {
      // action.payload ở đây chính là cái response.data trả về ở trên
      let board = action.payload

      // Thành viên trong board là gộp lại của 2 mảng owners và members
      board.FE_allUsers = board.owners.concat(board.members)

      // Sắp xếp thứ tự các column luôn ở đây trước khi đưa dữ liệu xuống bên dưới các component con
      board.columns = mapOrder(board.columns, board.columnOrderIds, '_id')

      board.columns.forEach(column => {
        // Khi  f5 trang web thì cần xử lý vấn đề kéo thả vào một column rỗng
        if (isEmpty(column.cards)) {
          column.cards = [generatePlaceholderCard(column)]
          column.cardOrderIds = [generatePlaceholderCard(column)._id]
        } else {
          // Sắp xếp thứ tự các cards luôn ở đây trước khi đưa dữ liệu xuống bên dưới các component con
          column.cards = mapOrder(column.cards, column.cardOrderIds, '_id')
        }
      })

      // Update lại dữ liệu của cái currentActiveBoard
      state.currentActiveBoard = board
    })
  }
})

// Action: Là nơi dành cho các components bên dưới gọi bằng dispatch() tới nó để cập nhập lại dữ liệu thông qua reducer (chyaj đông bộ)
export const { updateCurrentActiveBoard, updateCardInBoard, deleteCardInBoard } = activeBoardSlice.actions

// Selectors: Là nơi dành cho các components bên dưới gọi bằng hook useSelector() để lấy dữ liệu từ trong kho redux store ra sử dụng
export const selectCurrentActiveBoard = (state) => {
  return state.activeBoard.currentActiveBoard
}

// Cái file này tên là activeBoardSlice nhưng chúng ta sẽ export mọi thứ tên là Reducer
//export default activeBoardSlice.reducer
export const activeBoardReducer = activeBoardSlice.reducer
